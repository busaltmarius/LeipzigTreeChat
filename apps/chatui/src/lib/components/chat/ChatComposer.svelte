<script lang="ts">
	type Props = {
		value: string;
		pending?: boolean;
		disabled?: boolean;
		onChange?: (value: string) => void;
		onSubmit?: (value: string) => Promise<void> | void;
	};

	let {
		value,
		pending = false,
		disabled = false,
		onChange,
		onSubmit,
	}: Props = $props();

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

<div class="border-t border-stone-900/10 bg-stone-50/70 px-4 py-4 sm:px-6">
	<div class="mx-auto flex max-w-4xl items-end gap-3">
		<label class="sr-only" for="chat-prompt">Nachricht</label>
		<textarea
			id="chat-prompt"
			bind:this={textarea}
			class="max-h-56 min-h-[3.5rem] flex-1 resize-none rounded-[1.6rem] border border-stone-900/10 bg-white px-4 py-3 text-sm leading-6 text-stone-900 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-stone-100"
			placeholder="Schreibe deine Nachricht..."
			rows="1"
			value={value}
			disabled={pending || disabled}
			oninput={handleInput}
			onkeydown={handleKeyDown}
		></textarea>

		<button
			type="button"
			class="inline-flex h-14 items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-stone-300"
			disabled={pending || disabled || !value.trim()}
			onclick={() => void submitPrompt()}
		>
			{pending ? "Senden..." : "Senden"}
		</button>
	</div>
</div>
