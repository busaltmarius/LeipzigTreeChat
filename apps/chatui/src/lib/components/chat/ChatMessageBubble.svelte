<script lang="ts">
import type { ChatMessage } from "$lib/chat/types";

type Props = ChatMessage;

let { role, content }: Props = $props();

const isUserMessage = () => role === "user";
</script>

<article class={`flex ${isUserMessage() ? "justify-end" : "justify-start"}`}>
	<div
		class={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[75%] ${
			isUserMessage()
				? "rounded-br-md bg-emerald-700 text-white"
				: "rounded-bl-md border border-stone-900/8 bg-stone-50 text-stone-800"
		}`}
	>
		<p class="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] opacity-70">
			{isUserMessage() ? "Du" : "Baumbart"}
		</p>
		<p class="whitespace-pre-wrap wrap-break-words">{content}</p>
	</div>
</article>
