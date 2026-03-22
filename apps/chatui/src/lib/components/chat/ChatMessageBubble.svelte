<script lang="ts">
import { Marked } from "marked";
import type { ChatMessage } from "$lib/chat/types";

type Props = ChatMessage;

let { role, content, variant = "default" }: Props = $props();

const isUserMessage = () => role === "user";
const isErrorMessage = () => variant === "error";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const isSafeUrl = (value: string) => {
  try {
    const url = new URL(value, "https://baumbart.local");

    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const markdown = new Marked();

markdown.use({
  async: false,
  breaks: true,
  gfm: true,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    link({ href, title, tokens }) {
      if (!isSafeUrl(href)) {
        return this.parser.parseInline(tokens);
      }

      return false;
    },
    image({ text }) {
      return escapeHtml(text);
    },
  },
});

const renderMarkdown = (value: string) => markdown.parse(value) as string;
const renderedContent = $derived(renderMarkdown(content));
</script>

<article class={`rise-in flex ${isUserMessage() ? "justify-end" : "justify-start"}`}>
	{#if isUserMessage()}
		<div
			class="max-w-[min(30rem,88%)] rounded-[1.75rem] rounded-br-md bg-emerald-600 px-5 py-4 text-white shadow-[0_24px_70px_-38px_rgba(16,185,129,0.9)]"
		>
			<p class="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-white/72">
				Du
			</p>
			<div
				class="message-body text-[0.97rem] leading-7 text-white [&_a]:text-white [&_a]:underline [&_code]:bg-white/16 [&_code]:text-white [&_pre]:bg-white/12"
			>
				{@html renderedContent}
			</div>
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
				<div
					class={`message-body text-[1rem] leading-8 ${
						isErrorMessage()
							? "[&_a]:text-red-800 [&_code]:bg-red-100 [&_code]:text-red-950 [&_pre]:border-red-200/80 [&_pre]:bg-red-100/85"
							: "[&_a]:text-emerald-800 [&_code]:bg-stone-100 [&_code]:text-stone-950 [&_pre]:border-stone-200/80 [&_pre]:bg-stone-100/90"
					}`}
				>
					{@html renderedContent}
				</div>
			</div>
		</div>
	{/if}
</article>

<style>
	.message-body :global(*:first-child) {
		margin-top: 0;
	}

	.message-body :global(*:last-child) {
		margin-bottom: 0;
	}

	.message-body :global(p),
	.message-body :global(ul),
	.message-body :global(ol),
	.message-body :global(pre),
	.message-body :global(blockquote) {
		margin: 0 0 1rem;
	}

	.message-body :global(ul),
	.message-body :global(ol) {
		padding-left: 1.4rem;
	}

	.message-body :global(li + li) {
		margin-top: 0.35rem;
	}

	.message-body :global(code) {
		border-radius: 0.5rem;
		padding: 0.12rem 0.38rem;
		font-family: "SFMono-Regular", "SF Mono", "IBM Plex Mono", monospace;
		font-size: 0.92em;
	}

	.message-body :global(pre) {
		overflow-x: auto;
		border: 1px solid rgba(120, 113, 108, 0.18);
		border-radius: 1rem;
		padding: 0.9rem 1rem;
		line-height: 1.65;
	}

	.message-body :global(pre code) {
		background: transparent;
		padding: 0;
		border-radius: 0;
	}

	.message-body :global(a) {
		font-weight: 500;
		text-underline-offset: 0.2em;
	}

	.message-body :global(blockquote) {
		border-left: 3px solid rgba(120, 113, 108, 0.22);
		padding-left: 1rem;
		opacity: 0.92;
	}
</style>
