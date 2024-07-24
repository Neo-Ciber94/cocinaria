<script lang="ts">
	import Picture, { type PictureProps } from 'svelte-picture/svelte/Picture';

	let { width, height, ...rest }: PictureProps = $props();

	let isLoading = $state(true);
</script>

<!-- <div style:width={`${width}px`} style:height={`${height}px`} style:position="relative">
	<img
		{...rest}
		style:display="none"
		style:position="absolute"
		style:width={'100%'}
		style:height={'100%'}
		onload={() => {
			isLoading = false;
		}}
	/>
</div> -->

<Picture
	{...rest}
	{width}
	{height}
	onload={() => {
		isLoading = false;
	}}
/>
