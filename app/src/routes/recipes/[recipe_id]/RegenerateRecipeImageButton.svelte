<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import GenerateImageIcon from '$components/icons/generateImageIcon.svelte';
	import LoadingDotsIcon from '$components/icons/loadingDotsIcon.svelte';
	import { cn } from '$lib/index';
	import { Button } from 'bits-ui';
	import toast from 'svelte-french-toast';
	import { GenerateImageEvent } from '../../api/ai/recipe/image/events';
	import { consume } from 'sse';

	const recipeId = $derived($page.params.recipe_id);
	let props: { class?: string; disabled?: boolean } = $props();
	let loading = $state(false);

	async function regenerateRecipeImage() {
		if (!confirm('Generate a new recipe image')) {
			return;
		}

		loading = true;

		consume(`/api/ai/recipe/image?recipe_id=${recipeId}`, {
			onClose() {
				loading = false;
			},
			onError() {
				toast.error('Internal Error');
			},
			async onData(eventName, data) {
				switch (eventName) {
					case GenerateImageEvent.Failure:
					case GenerateImageEvent.InternalError: {
						toast.error(data as string);
						break;
					}
					case GenerateImageEvent.Success: {
						console.log({ data });
						const defaultError = 'Failed to generate recipe image';

						try {
							const result = data as { url?: string };

							if (!result.url) {
								toast.error(defaultError);
							}

							await invalidateAll();
						} catch (err) {
							toast.error(defaultError);
						}
						break;
					}
				}
			}
		});

		// eventSource.select(GenerateImageEvent.Failure).subscribe((msg) => {
		// 	toast.error(msg);
		// });

		// eventSource.select(GenerateImageEvent.InternalError).subscribe((msg) => {
		// 	toast.error(msg);
		// });

		// eventSource.select(GenerateImageEvent.Success).subscribe((data) => {
		// 	console.log({ data });
		// 	const defaultError = 'Failed to generate recipe image';

		// 	try {
		// 		const url = JSON.parse(data)?.url;

		// 		if (!url) {
		// 			toast.error(defaultError);
		// 		}

		// 		await invalidateAll();
		// 	} catch (err) {
		// 		toast.error(defaultError);
		// 	}
		// });
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
