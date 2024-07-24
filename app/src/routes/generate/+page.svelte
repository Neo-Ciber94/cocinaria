<script lang="ts">
	import SparkIcon from '$components/icons/sparkIcon.svelte';
	import { quintOut } from 'svelte/easing';
	import { fly, scale } from 'svelte/transition';
	import AmountIndicator from './AmountIndicator.svelte';
	import { useRecipeItems } from './useRecipeItems.svelte';
	import LoadingIcon from '$components/icons/loadingIcon.svelte';
	import { cn } from '$lib/utils';
	import RecipeLoading from './RecipeLoading.svelte';
	import { recipeTypeSchema } from '$lib/common/recipe';
	import { useLocalStorage } from '$lib/hooks/useLocalStorage.svelte';
	import type { Ingredient } from '$lib/common/ingredients';
	import { MIN_RECIPE_INGREDIENTS, MAX_RECIPE_INGREDIENTS } from '$lib/common/constants';
	import toast from 'svelte-french-toast';
	import { beforeNavigate, goto } from '$app/navigation';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';
	import { getResponseError } from '$lib/client/getResponseError';
	import LoadingDotsIcon from '$components/icons/loadingDotsIcon.svelte';
	import { useDebounce } from '$lib/hooks/useDebounced.svelte';
	import { useIsMounted } from '$lib/hooks/useIsMounted.svelte';
	import SelectRecipeType from './SelectRecipeType.svelte';
	import SelectIngredient from './SelectIngredient.svelte';
	import { Button } from '$components/ui/button';
	import { useAuth } from '$lib/hooks/useAuth.svelte';
	import { reportRecipeGenerationStates } from './utils.svelte';
	import { useAlertManager } from '$components/alerts/useAlertManager.svelte';
	import { delay } from '$lib/index';

	const recipeItems = useRecipeItems([{ id: crypto.randomUUID(), ingredient: undefined }]);
	const selectedIngredients = $derived.by(() => {
		return recipeItems.selectedItems.map((e) => e.ingredient).filter(Boolean) as Ingredient[];
	});

	const selectedCount = $derived(selectedIngredients.length);
	const recipeTypeStorage = useLocalStorage(
		'cocinaria:generate-recipe-type',
		recipeTypeSchema.optional(),
		{
			storage: () => sessionStorage
		}
	);

	let isGenerating = $state(false);
	const alertManager = useAlertManager();
	const auth = useAuth()!; // The user should be authenticated to be in this page
	const mounted = useIsMounted();
	const canGenerate = $derived.by(() => {
		return selectedCount >= MIN_RECIPE_INGREDIENTS && recipeTypeStorage.value != null;
	});

	const ingredientsLoading = useDebounce(() => recipeItems.pending, 1000);
	const canPickIngredients = $derived.by(
		() => (!isGenerating && !ingredientsLoading) || recipeTypeStorage.value != null
	);

	const ingredientImages = $derived.by(() => {
		return recipeItems.selectedItems
			.filter((e) => Boolean(e.ingredient))
			.map((e) => e.ingredient?.image) as string[];
	});

	beforeNavigate(({ type, cancel }) => {
		if (isGenerating) {
			if (type !== 'leave') {
				if (confirm('Recipe still genererating, want to leave?')) {
					return;
				}
			}

			cancel();
		}
	});

	async function generateRecipe() {
		if (isGenerating) {
			return;
		}

		const success = await alertManager.confirm({
			title: 'Generate Recipe',
			description: `Generate recipe with the selected ingredients? ${ingredientImages.join(' ')}`
		});

		if (!success) {
			return;
		}

		try {
			isGenerating = true;

			// We update immediately the UI
			auth.consumeCredit();

			const ingredients = selectedIngredients.map((e) => e.value);
			const recipeType = recipeTypeStorage.value;

			const res = await fetch('/api/ai/recipe/generate', {
				method: 'POST',
				body: JSON.stringify({ ingredients, recipeType })
			});

			if (!res.ok || res.body == null) {
				const message = await getResponseError(res, 'Failed to generate recipe');
				toast.error(message);
				return;
			}

			// We just consume the stream until it's done and show state changes
			const reader = res.body.getReader();
			const recipeJson = await reportRecipeGenerationStates(reader);

			if (recipeJson) {
				recipeItems.clear();
				recipeTypeStorage.remove();

				await delay(1000); // Instead of do a query to check if already exists, we just wait 1 second
				await goto(`/recipes/${recipeJson.recipeId}`, { invalidateAll: true });
			}
		} catch (err) {
			console.error(err);

			const message = err instanceof Error ? err.message : 'Failed to generate recipe';
			toast.error(message, { position: 'bottom-center' });
		} finally {
			isGenerating = false;
		}
	}
</script>

<SvelteSeo title={(baseTitle) => `${baseTitle} | Generate`} />

<div class="container mx-auto h-full w-full max-w-xl p-4 pt-10 sm:pt-20 lg:max-w-3xl">
	<div
		class="bg-background flex flex-col gap-2 rounded-xl border border-gray-200 px-4 pb-6 pt-8 shadow-md"
	>
		<h1 class="mx-auto flex flex-row items-center gap-2 text-2xl text-orange-400 sm:text-4xl">
			<SparkIcon class="size-8 sm:size-12" animated />
			<span>Generate Recipe</span>
		</h1>

		<p class="rounded-lg bg-orange-100 p-4 text-center shadow-sm">
			Select from <strong>2</strong> up to <strong>10</strong> to generate a new recipe using our AI
		</p>

		<div class="mx-auto mt-10 flex w-full flex-col items-center gap-2">
			<h2 class="self-start font-mono text-xl font-bold">Recipe</h2>
			<div class="w-full" in:scale={{ duration: 300, opacity: 0.5, start: 0.9, easing: quintOut }}>
				<SelectRecipeType
					class="w-full"
					bind:selected={recipeTypeStorage.value}
					disabled={isGenerating}
				/>
			</div>

			{#if ingredientsLoading.value}
				<div class="flex h-full w-full flex-row items-center justify-center p-4">
					<LoadingDotsIcon class="size-10 text-orange-300" />
				</div>
			{:else if recipeTypeStorage.value}
				<h2 class="mt-5 self-start font-mono text-xl font-bold">Ingredients</h2>
				{#if mounted.value && selectedCount > 0}
					<div
						class="w-full"
						transition:scale={{ duration: 300, opacity: 0.2, start: 0.8, easing: quintOut }}
					>
						<AmountIndicator
							min={MIN_RECIPE_INGREDIENTS}
							max={MAX_RECIPE_INGREDIENTS}
							count={selectedCount}
						/>
					</div>
				{/if}

				{#if isGenerating}
					<div
						class="my-5 w-[200px]"
						transition:scale={{ duration: 300, opacity: 0.5, start: 0.3, easing: quintOut }}
					>
						<RecipeLoading images={ingredientImages} />
					</div>
				{:else}
					{#each recipeItems.selectedItems as item, index (item.id)}
						{#if mounted.value}
							<div
								class="flex w-full flex-row items-center gap-2"
								transition:fly={{
									duration: 300,
									delay: index * 50,
									x: -100,
									opacity: 0.1,
									easing: quintOut
								}}
							>
								<SelectIngredient
									class="w-full"
									disabled={isGenerating}
									ingredients={recipeItems.remainingIngredients}
									selected={item.ingredient}
									onchange={(ingredient) => recipeItems.update(item.id, ingredient)}
								/>

								<Button
									disabled={isGenerating}
									class={cn(
										`rounded-md bg-red-500 text-white`,
										isGenerating ? '' : 'hover:bg-red-600',
										'disabled:cursor-not-allowed disabled:opacity-70'
									)}
									onclick={() => recipeItems.remove(item.id)}
									>Remove
								</Button>
							</div>
						{/if}
					{:else}
						<h3 class="text-neutral-400/90">No ingredients selected</h3>
					{/each}
				{/if}
			{/if}

			<div class="mt-2 flex w-full flex-col justify-between gap-2 sm:flex-row">
				<Button
					disabled={!canGenerate || isGenerating}
					onclick={generateRecipe}
					class={cn(
						`relative flex w-full flex-row items-center justify-center gap-1 rounded-lg bg-neutral-700 text-white`,
						!canGenerate || isGenerating ? '' : 'hover:bg-neutral-800',
						'disabled:cursor-not-allowed disabled:opacity-70'
					)}
				>
					{#if isGenerating}
						<LoadingIcon class="size-6 text-white" />
						<span> Generating</span>
					{:else}
						<SparkIcon class="size-6" />
						<span> Generate</span>
					{/if}
				</Button>

				<Button
					disabled={!canPickIngredients}
					onclick={recipeItems.add}
					class={cn(
						'relative flex w-full flex-row items-center justify-center gap-1 rounded-lg bg-orange-500 text-white',
						!canPickIngredients ? '' : ' hover:bg-orange-600',
						'disabled:cursor-not-allowed disabled:opacity-70',
						{
							'animate-pulse': recipeItems.pending
						}
					)}
				>
					{#if recipeItems.pending}
						<LoadingIcon class="size-6 text-white" />
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-white" viewBox="0 0 24 24">
							<path
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 12h14m-7-7v14"
							/>
						</svg>
					{/if}

					<span> Add Ingredient </span>
				</Button>
			</div>
		</div>
	</div>
</div>
