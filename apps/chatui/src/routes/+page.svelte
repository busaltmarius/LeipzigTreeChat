<script lang="ts">
import { onMount } from "svelte";
import { browser } from "$app/environment";
import type { ChatMessage, ChatSocketClientMessage, ChatSocketServerMessage } from "$lib/chat/types";
import ChatComposer from "$lib/components/chat/ChatComposer.svelte";
import ChatShell from "$lib/components/chat/ChatShell.svelte";
import ChatTranscript from "$lib/components/chat/ChatTranscript.svelte";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();
const createInitialMessages = () => data.messages.map((message) => ({ ...message }));

let messages = $state<ChatMessage[]>(createInitialMessages());
let prompt = $state("");
let isSubmitting = $state(false);
let error = $state("");
let isConnected = $state(false);

let socket: WebSocket | null = null;
let reconnectTimeout: number | null = null;
let shouldReconnect = true;
let previousMessagesBeforeSubmit: ChatMessage[] | null = null;

const scheduleReconnect = () => {
  if (!browser || reconnectTimeout || !shouldReconnect) {
    return;
  }

  reconnectTimeout = window.setTimeout(() => {
    reconnectTimeout = null;
    connectSocket();
  }, 1000);
};

	const handleSocketMessage = (rawEvent: MessageEvent<string>) => {
		try {
			const payload = JSON.parse(rawEvent.data) as ChatSocketServerMessage;

			if (payload.type === "chat.error") {
				messages = payload.messages;
				isSubmitting = false;
				previousMessagesBeforeSubmit = null;
				error = payload.error;
				return;
			}

			if (payload.type === "chat.state") {
				messages = payload.messages;
				return;
			}

			messages = [...messages, payload.message];
			isSubmitting = false;
			previousMessagesBeforeSubmit = null;
			error = "";
		} catch (parseError) {
    console.error("Failed to parse websocket payload", parseError);
    error = "Die Antwort des Chatbots konnte nicht gelesen werden.";
    isSubmitting = false;

    if (previousMessagesBeforeSubmit) {
      messages = previousMessagesBeforeSubmit;
      previousMessagesBeforeSubmit = null;
    }
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
    error = "";
  });

  socket.addEventListener("message", handleSocketMessage);

  socket.addEventListener("close", () => {
    isConnected = false;

    if (isSubmitting && previousMessagesBeforeSubmit) {
      messages = previousMessagesBeforeSubmit;
      previousMessagesBeforeSubmit = null;
      isSubmitting = false;
      error = "Die Verbindung wurde unterbrochen. Bitte versuche es erneut.";
    }

    if (shouldReconnect) {
      scheduleReconnect();
    }
  });

  socket.addEventListener("error", () => {
    isConnected = false;
    error = "Die Echtzeitverbindung ist aktuell nicht verfuegbar.";
  });
};

const handlePromptChange = (value: string) => {
  prompt = value;

  if (error) {
    error = "";
  }
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
    error = "Die Echtzeitverbindung ist noch nicht bereit.";
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
  error = "";
  isSubmitting = true;

  try {
    socket.send(JSON.stringify(payload));
  } catch (socketError) {
    console.error("Failed to send websocket chat prompt", socketError);
    messages = previousMessages;
    previousMessagesBeforeSubmit = null;
    error = "Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.";
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
</script>

<ChatShell>
	<div class="flex min-h-0 flex-1 flex-col">
		{#if !isConnected}
			<div class="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:px-6">
				Verbinde den Chat ueber WebSocket...
			</div>
		{/if}

		{#if error}
			<div class="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:px-6">
				{error}
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
