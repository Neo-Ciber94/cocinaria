<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import GenerateImageIcon from '$components/icons/generateImageIcon.svelte';
	import LoadingDotsIcon from '$components/icons/loadingDotsIcon.svelte';
	import { cn } from '$lib/utils';
	import { Button } from 'bits-ui';
	import toast from 'svelte-french-toast';
	import { execute, TaskError } from 'svelte-stream/task';
	import type { GeneratedImage } from '../../api/ai/recipe/image/+server';

	const recipeId = $derived($page.params.recipe_id);
	let props: { class?: string; disabled?: boolean } = $props();
	let loading = $state(false);

	async function regenerateRecipeImage() {
		if (!confirm('Generate a new recipe image')) {
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

<Button.Root
	onclick={regenerateRecipeImage}
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
