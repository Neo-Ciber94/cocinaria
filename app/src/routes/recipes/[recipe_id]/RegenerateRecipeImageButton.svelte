<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import GenerateImageIcon from '$components/icons/generateImageIcon.svelte';
	import LoadingDotsIcon from '$components/icons/loadingDotsIcon.svelte';
	import { cn } from '$lib/index';
	import { Button } from 'bits-ui';
	import toast from 'svelte-french-toast';

	let props: { class?: string; disabled?: boolean } = $props();
	let loading = $state(false);
</script>

<form
	method="post"
	class={props.class}
	action={`?/generateImage`}
	use:enhance={({ cancel }) => {
		if (!confirm('Generate a new recipe image')) {
			return cancel();
		}

		loading = true;
		return async ({ result }) => {
			switch (result.type) {
				case 'success': {
					console.log(result);
					// FIXME: We shouldn't be invalidating all the cache
					await invalidateAll();
					break;
				}
				case 'error':
				case 'failure': {
					toast.error('Failed to generate recipe image');
					break;
				}
			}

			loading = false;
		};
	}}
>
	<Button.Root
		disabled={loading || props.disabled}
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
