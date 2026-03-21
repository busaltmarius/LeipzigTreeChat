<script lang="ts">
import type { ChatMessage } from "$lib/chat/types";

type Props = ChatMessage;

let { role, content, variant = "default" }: Props = $props();

const isUserMessage = () => role === "user";
const isErrorMessage = () => variant === "error";
</script>

<article class={`rise-in flex ${isUserMessage() ? "justify-end" : "justify-start"}`}>
	{#if isUserMessage()}
		<div
			class="max-w-[min(30rem,88%)] rounded-[1.75rem] rounded-br-md bg-emerald-600 px-5 py-4 text-white shadow-[0_24px_70px_-38px_rgba(16,185,129,0.9)]"
		>
			<p class="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-white/72">
				Du
			</p>
			<p class="whitespace-pre-wrap wrap-break-word text-[0.97rem] leading-7">{content}</p>
		</div>
	{:else}
		<div class="max-w-[min(46rem,100%)]">
			<div
				class={`mb-3 flex items-center gap-3 text-[0.64rem] font-semibold uppercase tracking-[0.3em] ${
					isErrorMessage() ? "text-red-700" : "text-stone-500"
				}`}
			>
				<span
					class={`h-2.5 w-2.5 rounded-full ${
						isErrorMessage() ? "bg-red-500" : "bg-emerald-500 soft-pulse"
					}`}
				></span>
				<span>{isErrorMessage() ? "Hinweis" : "Baumbart"}</span>
			</div>

			<div
				class={`rounded-[1.9rem] px-6 py-5 text-stone-800 ${
					isErrorMessage()
						? "border border-red-300/80 bg-red-50/95 text-red-950 shadow-[0_18px_50px_-42px_rgba(220,38,38,0.45)] ring-1 ring-red-200/70"
						: "border border-white/70 bg-white/58 shadow-[0_30px_90px_-48px_rgba(28,25,23,0.46)] backdrop-blur-sm"
				}`}
			>
				<p class="whitespace-pre-wrap wrap-break-word text-[1rem] leading-8">{content}</p>
			</div>
		</div>
	{/if}
</article>
