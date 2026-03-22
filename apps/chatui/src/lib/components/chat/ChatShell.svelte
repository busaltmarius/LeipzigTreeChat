<script lang="ts">
import type { Snippet } from "svelte";

type Props = {
  children: Snippet;
  isConnected: boolean;
};

let { children, isConnected }: Props = $props();
</script>

<div class="relative min-h-screen overflow-x-hidden">
	<div class="pointer-events-none absolute inset-0">
		<div
			class="absolute left-[6%] top-[11%] h-64 w-64 rounded-full bg-emerald-300/18 blur-3xl"
		></div>
		<img
			class="absolute -right-12 top-28 hidden h-96 w-[24rem] rotate-10 object-contain opacity-[0.07] saturate-0 lg:block"
			src="/baumbart-logo-transparent.png"
			alt=""
			aria-hidden="true"
		/>
	</div>

	<div class="fixed inset-x-0 top-0 z-30">
		<div class="mx-auto max-w-384 px-4 pt-4 sm:px-6 lg:px-10">
			<header
				class="rise-in flex items-start justify-between gap-4 rounded-4xl border border-white/45 bg-white/34 px-4 py-2 shadow-[0_18px_60px_-42px_rgba(28,25,23,0.45)] backdrop-blur-[14px] sm:px-5"
			>
				<div class="flex min-w-0 items-center gap-3 sm:gap-4">
					<div
						class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.35rem] border border-white/65 bg-white/72 shadow-[0_14px_40px_-26px_rgba(28,25,23,0.5)] backdrop-blur"
					>
						<img class="h-9 w-9" src="/baumbart-logo-transparent.png" alt="Baumbart logo" />
					</div>

					<div class="min-w-0">
						<p class="text-[0.64rem] font-semibold uppercase tracking-[0.32em] text-stone-500">
							Leipziger Baumwächter
						</p>
						<h1 class="mt-1 text-[1.35rem] font-semibold tracking-[-0.03em] text-stone-950 sm:text-2xl">
							Baumbart
						</h1>
						<p class="mt-1 max-w-xl text-sm leading-6 text-stone-600">
							Fragen zu Baumarten, Standorten und Stadtgrün in Leipzig.
						</p>
					</div>
				</div>

				<div
					class={`rounded-[1.4rem] self-center border px-3 py-2 backdrop-blur sm:px-4 ${
						isConnected
							? "border-emerald-900/10 bg-white/72 text-stone-700 shadow-[0_16px_50px_-30px_rgba(35,31,24,0.38)]"
							: "border-amber-900/10 bg-amber-50/88 text-amber-950 shadow-[0_16px_50px_-30px_rgba(146,64,14,0.26)]"
					}`}
				>
					<div class="gap-3">
						<div
							class={`h-2.5 w-2.5 inline-block mr-1 rounded-full ${
								isConnected ? "bg-emerald-500" : "bg-amber-500"
							}`}
						></div>
						<span class="truncate align-middle text-[0.62rem] font-semibold uppercase tracking-[0.28em]">
							{isConnected ? "Verbunden" : "Nicht verbunden"}
						</span>
					</div>
				</div>
			</header>
		</div>
	</div>

	<div class="relative mx-auto flex min-h-screen max-w-384 flex-col px-4 pb-6 pt-32 sm:px-6 sm:pt-36 lg:px-10">
		<div class="flex min-h-0 flex-1 flex-col">
			{@render children()}
		</div>
	</div>
</div>
