<script lang="ts">
import { tick } from "svelte";
import type { ChatMessage } from "$lib/chat/types";
import ChatMessageBubble from "./ChatMessageBubble.svelte";

type Props = {
  messages: ChatMessage[];
};

let { messages }: Props = $props();

let container: HTMLDivElement | undefined;

const scrollToLatest = async () => {
  await tick();
  container?.scrollTo({
    top: container.scrollHeight,
    behavior: "smooth",
  });
};

$effect(() => {
  messages.length;
  void scrollToLatest();
});
</script>

<div bind:this={container} class="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
	<div class="mx-auto flex max-w-208 flex-col gap-10 px-1 pb-44 pt-8 sm:px-4">
		{#each messages as message, index (`${message.role}-${index}-${message.content}`)}
			<ChatMessageBubble role={message.role} content={message.content} />
		{/each}
	</div>
</div>
