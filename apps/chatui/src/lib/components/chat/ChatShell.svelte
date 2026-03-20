<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<div class="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
	<div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-stone-900/10 bg-white/85 shadow-[0_24px_80px_-32px_rgba(28,25,23,0.45)] backdrop-blur">
		<header class="border-b border-stone-900/10 px-5 py-4 sm:px-6">
			<div class="flex items-center gap-4">
				<div class="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-stone-900/10">
					<img class="h-14 w-14" src="/baumbart-logo.png" alt="Baumbart logo" />
				</div>

				<div class="min-w-0">
					<p class="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-800/80">
						Baumwächter von Leipzig
					</p>
					<h1 class="mt-2 font-serif text-2xl text-stone-950 sm:text-3xl">
						Baumbart
					</h1>
					<p class="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
						Stelle Fragen rund um Bäume in Leipzig!
					</p>
				</div>
			</div>
		</header>

		<div class="flex min-h-0 flex-1 flex-col">
			{@render children()}
		</div>
	</div>
</div>
