<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import LoadingDotsIcon from '$components/icons/loadingDotsIcon.svelte';
	import TrashCanIcon from '$components/icons/trashCanIcon.svelte';
	import { Button } from '$components/ui/button';
	import { cn } from '$lib/utils';
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
					setTimeout(() => goto('/my-recipes'), 500);
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
	<Button
		type="submit"
		disabled={loading || props.disabled}
		class={cn(
			'mb-2 flex flex-row items-center justify-center gap-2 bg-red-500 px-10 text-white',
			loading ? 'cursor-wait disabled:opacity-70' : ' hover:bg-red-600'
		)}
	>
		{#if loading}
			<LoadingDotsIcon class="size-6" />
			<span> Deleting...</span>
		{:else}
			<TrashCanIcon class="size-6" />
			<span> Delete Recipe</span>
		{/if}
	</Button>
</form>
