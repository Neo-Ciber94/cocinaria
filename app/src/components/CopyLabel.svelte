<script lang="ts">
	import { cn } from '$lib/utils';
	import { fly } from 'svelte/transition';
	import { bounceInOut } from 'svelte/easing';

	let { copy, text, ...rest }: { copy: string; text: string; class?: string } = $props();
	let wasCopied = $state(false);
	let timeout: number | undefined;

	function handleCopy() {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(copy);
			wasCopied = true;

			if (timeout) {
				clearTimeout(timeout);
			}

			timeout = window.setTimeout(() => {
				wasCopied = false;
			}, 1000);
		}
	}
</script>

<button
	class={cn(
		'relative flex flex-row gap-2 items-center whitespace-nowrap text-xs bg-gray-100 hover:bg-gray-200 transition-colors rounded-md px-2 sm:px-1 py-1',
		rest.class
	)}
	onclick={handleCopy}
>
	<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24">
		<g
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
		>
			<path d="M16 3H4v13" />
			<path d="M8 7h12v12a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" />
		</g>
	</svg>
	<span class="whitespace-nowrap text-ellipsis overflow-hidden">{text}</span>

	{#if wasCopied}
		<div
			transition:fly={{ duration: 100, x: 0, y: -30, opacity: 0.5, easing: bounceInOut }}
			class="absolute border border-gray-300 w-fit -bottom-7 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-1 rounded-lg"
		>
			📄 User ID copied!
		</div>
	{/if}
</button>
