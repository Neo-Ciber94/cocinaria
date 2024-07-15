<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate, invalidateAll } from '$app/navigation';
	import GenerateImageIcon from '$components/icons/generateImageIcon.svelte';
	import LoadingDotsIcon from '$components/icons/loadingDotsIcon.svelte';
	import { cn } from '$lib/index';
	import { Button } from 'bits-ui';

	let loading = $state(false);
</script>

<form
	method="post"
	class="w-full"
	action={`?/generateImage`}
	use:enhance={() => {
		loading = true;
		return async ({ result }) => {
			console.log({ result });
			await invalidateAll();
			loading = false;
		};
	}}
>
	<Button.Root
		disabled={loading}
		class={cn(
			'p-4 py-2 rounded-md shadow-sm bg-gray-800 w-full text-white flex flex-row gap-2 items-center justify-center',
			loading ? 'disabled:opacity-70 cursor-wait' : ' hover:bg-gray-900'
		)}
	>
		{#if loading}
			<LoadingDotsIcon class="size-6" />
			<span> Generating Image</span>
		{:else}
			<GenerateImageIcon class="size-6" />
			<span> Regenerate Image</span>
		{/if}
	</Button.Root>
</form>
