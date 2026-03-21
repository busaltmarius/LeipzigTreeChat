<script lang="ts">
import { onMount } from "svelte";
import { browser } from "$app/environment";
import type {
  ChatMessage,
  ChatSocketClientMessage,
  ChatSocketMetadataEvent,
  ChatSocketServerMessage,
} from "$lib/chat/types";
import ChatComposer from "$lib/components/chat/ChatComposer.svelte";
import ChatShell from "$lib/components/chat/ChatShell.svelte";
import ChatTranscript from "$lib/components/chat/ChatTranscript.svelte";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();
const createInitialMessages = () => data.messages.map((message) => ({ ...message }));

let messages = $state<ChatMessage[]>(createInitialMessages());
let prompt = $state("");
let isSubmitting = $state(false);
let isConnected = $state(false);
let metadata = $state<ChatSocketMetadataEvent | null>(null);

let socket: WebSocket | null = null;
let reconnectTimeout: number | null = null;
let shouldReconnect = true;
let previousMessagesBeforeSubmit: ChatMessage[] | null = null;

const metadataDisplay = {
  GATHERING_DATA: {
    title: "Sammle Daten",
    description: "Ich suche passende Informationen im Wissensbestand.",
  },
  GENERATING_RESPONSE: {
    title: "Generiere Antwort",
    description: "Ich formuliere gerade die Antwort für dich.",
  },
  GENERATING_CLARIFICATION: {
    title: "Generiere Rückfrage",
    description: "Ich bereite eine präzise Rückfrage vor.",
  },
} as const;

const getVisibleMetadata = (event: ChatSocketMetadataEvent | null) => {
  if (!event) {
    return null;
  }

  if (
    event.status !== "GATHERING_DATA" &&
    event.status !== "GENERATING_RESPONSE" &&
    event.status !== "GENERATING_CLARIFICATION"
  ) {
    return null;
  }

  return {
    ...metadataDisplay[event.status],
    status: event.status,
  };
};

const scheduleReconnect = () => {
  if (!browser || reconnectTimeout || !shouldReconnect) {
    return;
  }

  reconnectTimeout = window.setTimeout(() => {
    reconnectTimeout = null;
    connectSocket();
  }, 1000);
};

const appendAssistantErrorMessage = (message: string, baseMessages: ChatMessage[] = messages) => {
  const nextMessages = [...baseMessages];
  const lastMessage = nextMessages.at(-1);

  if (lastMessage?.role === "assistant" && lastMessage.variant === "error" && lastMessage.content === message) {
    messages = nextMessages;
    return;
  }

  messages = [
    ...nextMessages,
    {
      role: "assistant",
      content: message,
      variant: "error",
    },
  ];
};

const handleSocketMessage = (rawEvent: MessageEvent<string>) => {
  try {
    const payload = JSON.parse(rawEvent.data) as ChatSocketServerMessage;

    if (payload.type === "chat.error") {
      messages = payload.messages;
      isSubmitting = false;
      previousMessagesBeforeSubmit = null;
      appendAssistantErrorMessage(payload.error, payload.messages);
      metadata = {
        type: "chat.metadata",
        status: "ERROR",
        message: payload.error,
      };
      return;
    }

    if (payload.type === "chat.state") {
      messages = payload.messages;
      return;
    }

    if (payload.type === "chat.metadata") {
      metadata = payload;

      if (payload.status === "WAITING_FOR_INPUT" || payload.status === "ERROR") {
        isSubmitting = false;
        previousMessagesBeforeSubmit = null;
      }

      if (payload.status === "ERROR") {
        appendAssistantErrorMessage(payload.message);
      }

      return;
    }

    messages = [...messages, payload.message];
    isSubmitting = false;
    previousMessagesBeforeSubmit = null;
  } catch (parseError) {
    console.error("Failed to parse websocket payload", parseError);
    isSubmitting = false;

    if (previousMessagesBeforeSubmit) {
      messages = previousMessagesBeforeSubmit;
      previousMessagesBeforeSubmit = null;
    }

    appendAssistantErrorMessage("Die Antwort des Chatbots konnte nicht gelesen werden.");
  }
};

const connectSocket = () => {
  if (!browser) {
    return;
  }

  socket?.close();
  isConnected = false;
  socket = new WebSocket(data.websocketUrl);

  socket.addEventListener("open", () => {
    isConnected = true;
  });

  socket.addEventListener("message", handleSocketMessage);

  socket.addEventListener("close", () => {
    isConnected = false;

    if (isSubmitting && previousMessagesBeforeSubmit) {
      messages = previousMessagesBeforeSubmit;
      previousMessagesBeforeSubmit = null;
      isSubmitting = false;
      appendAssistantErrorMessage("Die Verbindung wurde unterbrochen. Bitte versuche es erneut.");
    }

    if (shouldReconnect) {
      scheduleReconnect();
    }
  });

  socket.addEventListener("error", () => {
    isConnected = false;
    appendAssistantErrorMessage("Die Echtzeitverbindung ist aktuell nicht verfuegbar.");
  });
};

const handlePromptChange = (value: string) => {
  prompt = value;
};

const submitPrompt = async (nextPrompt: string) => {
  if (isSubmitting) {
    return;
  }

  const trimmedPrompt = nextPrompt.trim();

  if (!trimmedPrompt) {
    return;
  }

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    appendAssistantErrorMessage("Die Echtzeitverbindung ist noch nicht bereit.");
    return;
  }

  const previousMessages = [...messages];
  previousMessagesBeforeSubmit = previousMessages;
  const payload: ChatSocketClientMessage = {
    type: "chat.send",
    prompt: trimmedPrompt,
  };

  messages = [
    ...messages,
    {
      role: "user",
      content: trimmedPrompt,
    },
  ];
  prompt = "";
  isSubmitting = true;

  try {
    socket.send(JSON.stringify(payload));
  } catch (socketError) {
    console.error("Failed to send websocket chat prompt", socketError);
    messages = previousMessages;
    previousMessagesBeforeSubmit = null;
    appendAssistantErrorMessage(
      "Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.",
      previousMessages
    );
    isSubmitting = false;
  }
};

onMount(() => {
  connectSocket();

  return () => {
    shouldReconnect = false;

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    socket?.close();
  };
});

const visibleMetadata = $derived(getVisibleMetadata(metadata));
</script>

<ChatShell>
	<div class="flex min-h-0 flex-1 flex-col">
		{#if !isConnected}
			<div class="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:px-6">
				Verbinde den Chat über WebSocket...
			</div>
		{:else if visibleMetadata}
			<div class="border-b border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 sm:px-6">
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-1.5">
						<span class="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-500"></span>
						<span class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
							{visibleMetadata.title}
						</span>
					</div>
					<p class="text-sm text-sky-800">
						{visibleMetadata.description}
					</p>
				</div>
			</div>
		{/if}

		<ChatTranscript {messages} />
		<ChatComposer
			value={prompt}
			pending={isSubmitting}
			disabled={!isConnected}
			onChange={handlePromptChange}
			onSubmit={submitPrompt}
		/>
	</div>
</ChatShell>
