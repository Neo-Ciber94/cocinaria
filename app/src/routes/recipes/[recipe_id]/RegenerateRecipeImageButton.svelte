<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import GenerateImageIcon from '$components/icons/generateImageIcon.svelte';
	import LoadingDotsIcon from '$components/icons/loadingDotsIcon.svelte';
	import { getResponseError } from '$lib/client/getResponseError';
	import { cn } from '$lib/index';
	import { Button } from 'bits-ui';
	import toast from 'svelte-french-toast';

	const recipeId = $derived($page.params.recipe_id);
	let props: { class?: string; disabled?: boolean } = $props();
	let loading = $state(false);

	// FIXME: this is a mess
	async function regenerateRecipeImage() {
		if (!confirm('Generate a new recipe image')) {
			return;
		}

		loading = true;

		try {
			// const res = await fetch(`/api/ai/recipe/image?recipe_id=${recipeId}`);

			// if (!res.ok) {
			// 	const message = await getResponseError(res);
			// 	toast.error(message);
			// 	return;
			// }

			// await invalidateAll();
			const source = new EventSource(`/api/ai/recipe/image?recipe_id=${recipeId}`);

			source.addEventListener('fail', (e) => {
				source.close();

				const err = JSON.parse(e.data);
				toast.error(err);
				loading = false;
			});

			source.addEventListener('data', async (e) => {
				source.close();

				const url = JSON.parse(e.data)?.url;

				if (!url) {
					toast.error('Failed to regenerate recipe image');
				}

				loading = false;
			});

			source.onerror = async (e) => {
				if (e.eventPhase !== EventSource.CLOSED) {
					toast.error('Internal Error');
				}

				source.close();
				await invalidateAll();
				loading = false;
			};
		} catch (err) {
			console.error(err);
			toast.error('Internal Error');
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
