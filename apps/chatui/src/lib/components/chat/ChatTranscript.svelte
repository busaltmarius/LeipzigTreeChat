<script lang="ts">
import { onMount, tick } from "svelte";
import type { ChatMessage } from "$lib/chat/types";
import ChatMessageBubble from "./ChatMessageBubble.svelte";

type Props = {
  messages: ChatMessage[];
};

let { messages }: Props = $props();

let content: HTMLDivElement | undefined;

const scrollToLatest = async () => {
  await tick();

  if (typeof window === "undefined") {
    return;
  }

  const scrollingElement = document.scrollingElement;

  if (!scrollingElement) {
    return;
  }

  window.scrollTo({
    top: scrollingElement.scrollHeight,
    behavior: "auto",
  });
};

onMount(() => {
  if (!content || typeof ResizeObserver === "undefined") {
    return;
  }

  const resizeObserver = new ResizeObserver(() => {
    void scrollToLatest();
  });

  resizeObserver.observe(content);

  return () => {
    resizeObserver.disconnect();
  };
});

$effect(() => {
  messages.length;
  void scrollToLatest();
});
</script>

<div class="min-h-0 flex-1 px-4 py-5 sm:px-6">
	<div bind:this={content} class="mx-auto flex max-w-208 flex-col gap-10 px-1 pb-56 pt-8 sm:px-4 sm:pb-60">
		{#each messages as message, index (`${message.role}-${index}-${message.content}`)}
			<ChatMessageBubble role={message.role} content={message.content} />
		{/each}
	</div>
</div>
