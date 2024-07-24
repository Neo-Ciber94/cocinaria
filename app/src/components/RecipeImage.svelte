<script lang="ts">
	import { cn } from '$lib/utils';
	import Picture, { type PictureProps } from 'svelte-picture/Picture';
	import { fade } from 'svelte/transition';

	type Props = PictureProps & { loadingAnimation?: boolean };
	let { width, height, widthOverride = 800, loadingAnimation = true, ...rest }: Props = $props();

	let isLoading = $state(true);
</script>

<div style:width style:height class="relative aspect-square object-cover">
	<Picture
		{...rest}
		{width}
		{height}
		{widthOverride}
		class={cn(
			'transition-opacity duration-200',
			loadingAnimation && isLoading ? 'opacity-0' : 'opacity-100'
		)}
		onload={() => {
			isLoading = false;
		}}
	/>

	{#if loadingAnimation}
		{#if isLoading}
			<div
				data-fallback-img
				class="absolute left-0 top-0 h-full w-full"
				out:fade={{ duration: 400 }}
			></div>
		{/if}
	{/if}
</div>

<style>
	div[data-fallback-img] {
		background: linear-gradient(-45deg, #fed7aa 40%, #fff7ed 50%, #fed7aa 60%);
		background-size: 300%;
		background-position-x: 100%;
		animation: shimmer 1s infinite linear;
	}

	@keyframes shimmer {
		to {
			background-position-x: 0%;
		}
	}
</style>
