<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import LoadingDotsIcon from '$components/icons/loadingDotsIcon.svelte';
	import TrashCanIcon from '$components/icons/trashCanIcon.svelte';
	import { cn } from '$lib/index';
	import { Button } from 'bits-ui';
	import type { ActionData } from './$types';
	import toast from 'svelte-french-toast';

	let props: { disabled?: boolean; onDeleted?: () => void } = $props();
	let loading = $state(false);
</script>

<form
	method="post"
	action={`?/deleteRecipe`}
	use:enhance={({ cancel }) => {
		if (!confirm('Delete this recipe?')) {
			return cancel();
		}

		loading = true;
		return async ({ result }) => {
			switch (result.type) {
				case 'success': {
					if(!(result.data as ActionData)?.deleted) {
                        toast.error("Unable to delete this recipe");
                        return;
                    }
                    
                    console.log(result);
                    
                    if (props.onDeleted) {
                        props.onDeleted();
                    }

					// FIXME: We shouldn't be invalidating all the cache
					await invalidateAll();

					toast.success('Recipe deleted successfully');
					setTimeout(() => goto('/my_recipes'), 500);
					break;
				}
				case 'error':
				case 'failure': {
					toast.error('Failed to delete recipe');
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
			'px-10 py-2 rounded-md shadow-sm bg-red-500 text-white flex flex-row gap-2 items-center justify-center mb-2',
			loading ? 'disabled:opacity-70 cursor-wait' : ' hover:bg-red-600'
		)}
	>
		{#if loading}
			<LoadingDotsIcon class="size-6" />
			<span> Deleting...</span>
		{:else}
			<TrashCanIcon class="size-6" />
			<span> Delete Recipe</span>
		{/if}
	</Button.Root>
</form>
