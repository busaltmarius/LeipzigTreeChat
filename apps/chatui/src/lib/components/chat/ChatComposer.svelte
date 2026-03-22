<script lang="ts">
type Props = {
  value: string;
  pending?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => Promise<void> | void;
};

let { value, pending = false, disabled = false, onChange, onSubmit }: Props = $props();

let textarea: HTMLTextAreaElement | undefined;

const resizeTextarea = () => {
  if (!textarea) {
    return;
  }

  textarea.style.height = "0px";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 224)}px`;
};

const handleInput = (event: Event) => {
  const nextValue = (event.currentTarget as HTMLTextAreaElement).value;
  onChange?.(nextValue);
  queueMicrotask(resizeTextarea);
};

const submitPrompt = async () => {
  const prompt = value.trim();

  if (!prompt || pending || disabled) {
    return;
  }

  await onSubmit?.(prompt);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    void submitPrompt();
  }
};

$effect(() => {
  value;
  resizeTextarea();
});
</script>

<div
	class="rounded-4xl border border-stone-950/10 bg-white/82 p-2 shadow-[0_28px_90px_-42px_rgba(28,25,23,0.52)] backdrop-blur-xl"
>
	<div class="flex items-center gap-3 rounded-3xl bg-white/72 px-3 py-2 sm:px-4">
		<div class="min-w-0 flex-1">
			<label class="sr-only" for="chat-prompt">Nachricht</label>
			<textarea
				id="chat-prompt"
				bind:this={textarea}
				class="max-h-56 w-full resize-none bg-transparent align-middle px-1 py-1 text-[0.97rem] leading-7 text-stone-900 outline-none disabled:cursor-not-allowed disabled:text-stone-400"
				placeholder="Frage nach Baumarten, Standorten oder Stadtgrün in Leipzig ..."
				rows="1"
				value={value}
				disabled={pending || disabled}
				oninput={handleInput}
				onkeydown={handleKeyDown}
			></textarea>
		</div>

		<div class="flex shrink-0 items-center gap-2">
			<p class="hidden text-xs text-stone-500 sm:block">
				{pending ? "Antwort wird erstellt ..." : "Enter sendet"}
			</p>

			<button
				type="button"
				class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-stone-300"
				disabled={pending || disabled || !value.trim()}
				onclick={() => void submitPrompt()}
				aria-label={pending ? "Antwort wird gesendet" : "Nachricht senden"}
			>
				<svg
					viewBox="0 0 24 24"
					class={`h-5 w-5 ${pending ? "soft-pulse" : ""}`}
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
				>
					{#if pending}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 6v6l4 2"
						></path>
						<circle cx="12" cy="12" r="8"></circle>
					{:else}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m5 12 13-5-4.5 13-2.2-5.3z"
						></path>
					{/if}
				</svg>
			</button>
		</div>
	</div>
</div>
