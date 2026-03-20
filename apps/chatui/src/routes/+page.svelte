<script lang="ts">
	import ChatComposer from "$lib/components/chat/ChatComposer.svelte";
	import ChatShell from "$lib/components/chat/ChatShell.svelte";
	import ChatTranscript from "$lib/components/chat/ChatTranscript.svelte";
	import type { ChatMessage } from "$lib/chat/types";
	import type { PageData } from "./$types";

	type ChatResponse = {
		error?: string;
		messages?: ChatMessage[];
	};

	let { data }: { data: PageData } = $props();
	const createInitialMessages = () => data.messages.map((message) => ({ ...message }));

	let messages = $state<ChatMessage[]>(createInitialMessages());
	let prompt = $state("");
	let isSubmitting = $state(false);
	let error = $state("");

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

		const previousMessages = [...messages];

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
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					prompt: trimmedPrompt,
				}),
			});
			const payload = (await response.json().catch(() => null)) as ChatResponse | null;

			if (payload?.messages) {
				messages = payload.messages;
			}

			if (!response.ok) {
				error = payload?.error ?? "Der Chatbot konnte gerade nicht antworten.";

				if (!payload?.messages) {
					messages = previousMessages;
				}
			}
		} catch (requestError) {
			console.error("Failed to submit chat prompt", requestError);
			messages = previousMessages;
			error = "Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.";
		} finally {
			isSubmitting = false;
		}
	};
</script>

<ChatShell>
	<div class="flex min-h-0 flex-1 flex-col">
		{#if error}
			<div class="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:px-6">
				{error}
			</div>
		{/if}

		<ChatTranscript {messages} />
		<ChatComposer value={prompt} pending={isSubmitting} onChange={handlePromptChange} onSubmit={submitPrompt} />
	</div>
</ChatShell>
