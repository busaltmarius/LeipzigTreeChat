<script lang="ts">
import type { Snippet } from "svelte";

type StatusTone = "connected" | "busy" | "offline";

type Props = {
	children: Snippet;
	statusLabel: string;
	statusDetail: string;
	statusTone?: StatusTone;
};

let {
	children,
	statusLabel,
	statusDetail,
	statusTone = "connected",
}: Props = $props();

const statusClasses: Record<StatusTone, string> = {
	connected:
		"border-emerald-900/10 bg-white/72 text-stone-700 shadow-[0_16px_50px_-30px_rgba(35,31,24,0.38)]",
	busy: "border-sky-900/10 bg-sky-50/85 text-sky-950 shadow-[0_16px_50px_-30px_rgba(20,88,164,0.28)]",
	offline:
		"border-amber-900/10 bg-amber-50/88 text-amber-950 shadow-[0_16px_50px_-30px_rgba(146,64,14,0.26)]",
};

const statusDotClasses: Record<StatusTone, string> = {
	connected: "bg-emerald-500",
	busy: "bg-sky-500 soft-pulse",
	offline: "bg-amber-500",
};
</script>

<div class="relative min-h-screen overflow-hidden">
	<div class="pointer-events-none absolute inset-0">
		<div
			class="bg-drift absolute left-[6%] top-[11%] h-64 w-64 rounded-full bg-emerald-300/18 blur-3xl"
		></div>
		<div
			class="bg-drift absolute -right-16 top-20 h-96 w-[24rem] rounded-full bg-white/60 blur-3xl"
			style="animation-delay: -5s"
		></div>
		<div
			class="absolute inset-x-0 top-0 h-88 bg-[linear-gradient(180deg,rgba(255,255,255,0.56),transparent)]"
		></div>
		<img
			class="absolute -right-12 top-28 hidden h-96 w-[24rem] rotate-10 object-contain opacity-[0.07] saturate-0 lg:block"
			src="/baumbart-logo.png"
			alt=""
			aria-hidden="true"
		/>
	</div>

	<div class="relative mx-auto flex min-h-screen max-w-384 flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-10">
		<header class="rise-in flex items-start justify-between gap-4 py-2">
			<div class="flex min-w-0 items-center gap-3 sm:gap-4">
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.35rem] border border-white/65 bg-white/72 shadow-[0_14px_40px_-26px_rgba(28,25,23,0.5)] backdrop-blur"
				>
					<img class="h-9 w-9" src="/baumbart-logo.png" alt="Baumbart logo" />
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
				class={`rounded-[1.4rem] border px-3 py-2 backdrop-blur sm:px-4 ${statusClasses[statusTone]}`}
			>
				<div class="flex items-center gap-3">
					<span class={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDotClasses[statusTone]}`}></span>
					<div class="min-w-0">
						<p class="truncate text-[0.62rem] font-semibold uppercase tracking-[0.28em]">
							{statusLabel}
						</p>
						<p class="hidden max-w-60 truncate text-xs text-stone-600 sm:block">
							{statusDetail}
						</p>
					</div>
				</div>
			</div>
		</header>

		<div class="flex min-h-0 flex-1 flex-col">
			{@render children()}
		</div>
	</div>
</div>
