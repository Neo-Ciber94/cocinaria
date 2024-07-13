<script lang="ts">
	import { cn } from '$lib';
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
	<span class="whitespace-nowrap text-ellipsis overflow-hidden">{text}</span>
	<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1l67.9 67.9V320c0 8.8-7.2 16-16 16m-192 48h192c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9l-67.8-67.9c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64M64 128c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64v-32h-48v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16h32v-48z"
		/>
	</svg>

	{#if wasCopied}
		<div
			transition:fly={{ duration: 100, x: 0, y: -30, opacity: 0.5, easing: bounceInOut }}
			class="absolute border border-gray-300 w-fit -bottom-7 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-1 rounded-lg"
		>
			📄 User ID copied!
		</div>
	{/if}
</button>
