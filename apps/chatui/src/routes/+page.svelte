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
const emptyStateTopics = ["Standorte", "Baumarten", "Pflege", "Stadtklima"];

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
const hasMessages = $derived(messages.length > 0);
const shellStatus = $derived.by(() => {
	if (!isConnected) {
		return {
			label: "Verbindung",
			detail: "WebSocket wird aufgebaut ...",
			tone: "offline" as const,
		};
	}

	if (visibleMetadata) {
		return {
			label: visibleMetadata.title,
			detail: visibleMetadata.description,
			tone: "busy" as const,
		};
	}

	return {
		label: "Bereit",
		detail: "Baumbart ist live.",
		tone: "connected" as const,
	};
});
</script>

<svelte:head>
	<title>Baumbart</title>
	<meta
		name="description"
		content="Baumbart beantwortet Fragen zu Baumarten, Standorten und Stadtgruen in Leipzig."
	/>
</svelte:head>

<ChatShell
	statusLabel={shellStatus.label}
	statusDetail={shellStatus.detail}
	statusTone={shellStatus.tone}
>
	<div class="flex min-h-0 flex-1 flex-col">
		{#if hasMessages}
			<ChatTranscript {messages} />

			<div class="pointer-events-none sticky bottom-0 z-10 px-4 pb-4 sm:px-6 lg:px-8">
				<div class="mx-auto max-w-4xl">
					{#if visibleMetadata}
						<div
							class="rise-in-delayed pointer-events-auto mb-3 inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/72 px-4 py-2 text-sm text-stone-700 shadow-[0_18px_50px_-34px_rgba(28,25,23,0.36)] backdrop-blur"
						>
							<span class="h-2.5 w-2.5 rounded-full bg-sky-500 soft-pulse"></span>
							<span class="font-medium">{visibleMetadata.description}</span>
						</div>
					{/if}

					<div class="pointer-events-auto rise-in-delayed">
						<ChatComposer
							value={prompt}
							pending={isSubmitting}
							disabled={!isConnected}
							onChange={handlePromptChange}
							onSubmit={submitPrompt}
						/>
					</div>
				</div>
			</div>
		{:else}
			<section class="flex flex-1 flex-col items-center justify-center px-4 pb-14 pt-10 text-center sm:px-6">
				<div class="rise-in relative mx-auto max-w-3xl">
					<div
						class="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/20 blur-3xl"
						aria-hidden="true"
					></div>
					<p class="relative text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-stone-500">
						Baumwissen für Leipzig
					</p>
					<h2
						class="relative mt-5 text-balance text-4xl font-semibold tracking-[-0.05em] text-stone-950 sm:text-5xl"
					>
						Was möchtest du heute über Leipzigs Bäume wissen?
					</h2>
					<p class="relative mt-5 text-balance text-base leading-8 text-stone-600 sm:text-lg">
						Stelle Fragen zu Arten, Standorten, Pflege und den Gruenraeumen der Stadt.
					</p>
				</div>

				<div class="rise-in-delayed mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-stone-500">
					{#each emptyStateTopics as topic, index}
						<span>{topic}</span>
						{#if index < emptyStateTopics.length - 1}
							<span class="text-stone-300" aria-hidden="true">/</span>
						{/if}
					{/each}
				</div>

				<div class="rise-in-delayed mt-10 w-full max-w-4xl">
					<ChatComposer
						value={prompt}
						pending={isSubmitting}
						disabled={!isConnected}
						onChange={handlePromptChange}
						onSubmit={submitPrompt}
					/>
				</div>

				<p class="rise-in-delayed mt-4 text-sm text-stone-500">
					{#if !isConnected}
						Verbinde den Chat gerade über WebSocket ...
					{:else if visibleMetadata}
						{visibleMetadata.description}
					{:else}
						Antworten erscheinen direkt im Verlauf darunter.
					{/if}
				</p>
			</section>
		{/if}
	</div>
</ChatShell>
