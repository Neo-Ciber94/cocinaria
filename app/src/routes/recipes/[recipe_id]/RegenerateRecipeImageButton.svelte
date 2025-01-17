<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import GenerateImageIcon from '$components/icons/generateImageIcon.svelte';
	import LoadingDotsIcon from '$components/icons/loadingDotsIcon.svelte';
	import { cn } from '$lib/utils';
	import toast from 'svelte-french-toast';
	import { execute, TaskError } from 'svelte-stream/task';
	import type { GeneratedImage } from '../../api/ai/recipe/image/+server';
	import { Button } from '$components/ui/button';
	import { useAlertManager } from '$components/alerts/useAlertManager.svelte';

	const recipeId = $derived($page.params.recipe_id);
	let props: { class?: string; disabled?: boolean } = $props();
	let loading = $state(false);

	const alertManager = useAlertManager();

	async function regenerateRecipeImage() {
		const success = await alertManager.confirm({
			title: 'Regenerate Image',
			description: 'Generate a new recipe image?'
		});

		if (!success) {
			return;
		}

		loading = true;

		try {
			const result = await execute<GeneratedImage>(`/api/ai/recipe/image?recipe_id=${recipeId}`);

			if (!result.url) {
				toast.error('Failed to update the recipe with the new image');
			}

			await invalidateAll();
		} catch (err) {
			if (err instanceof TaskError) {
				toast.error(err.message);
			}

			toast.error('Failed to generate image');
		} finally {
			loading = false;
		}
	}
</script>

<Button
	onclick={regenerateRecipeImage}
	disabled={loading || props.disabled}
	class={cn(
		'flex w-full flex-row items-center justify-center gap-2 bg-gray-800 text-white',
		loading ? 'cursor-wait disabled:opacity-70' : ' hover:bg-gray-900'
	)}
>
	<svelte:fragment>
		{#if loading}
			<LoadingDotsIcon class="size-6" />
			<span> Generating Image</span>
		{:else}
			<GenerateImageIcon class="size-6" />
			<span> Regenerate Image</span>
		{/if}
	</svelte:fragment>
</Button>
