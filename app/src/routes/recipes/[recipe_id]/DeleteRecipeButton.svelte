<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { useAlertManager } from '$components/alerts/useAlertManager.svelte';
	import LoadingDotsIcon from '$components/icons/loadingDotsIcon.svelte';
	import TrashCanIcon from '$components/icons/trashCanIcon.svelte';
	import { Button } from '$components/ui/button';
	import { cn } from '$lib/utils';
	import type { ActionData } from './$types';
	import toast from 'svelte-french-toast';

	let props: { disabled?: boolean; onDeleted?: () => void; class?: string } = $props();
	const alertManager = useAlertManager();
	let loading = $state(false);
</script>

<form
	class="contents"
	method="post"
	action={`?/deleteRecipe`}
	use:enhance={async ({ cancel }) => {
		const success = await alertManager.confirm({
			title: 'Delete',
			description: 'Delete this recipe?'
		});

		if (!success) {
			return cancel();
		}

		loading = true;
		return async ({ result }) => {
			switch (result.type) {
				case 'success': {
					const data = result.data as ActionData;
					if (!data || data.deleted === false) {
						toast.error('Unable to delete this recipe');
						return;
					}

					if (props.onDeleted) {
						props.onDeleted();
					}

					// FIXME: We shouldn't be invalidating all the cache
					toast.success('Recipe deleted successfully');
					await goto('/my-recipes', { invalidateAll: true });
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
			'mb-2 flex flex-row items-center justify-center gap-2 bg-red-500 px-2 text-white',
			loading ? 'cursor-wait disabled:opacity-70' : ' hover:bg-red-600',
			props.class
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
