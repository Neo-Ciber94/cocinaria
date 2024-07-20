<script lang="ts">
	import SparkIcon from '$components/icons/sparkIcon.svelte';
	import { Button } from 'bits-ui';
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
	import { goto } from '$app/navigation';
	import type { GeneratedRecipeType } from '$lib/server/ai/recipe';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';
	import { getResponseError } from '$lib/client/getResponseError';
	import LoadingDotsIcon from '$components/icons/loadingDotsIcon.svelte';
	import { useDebounce } from '$lib/hooks/useDebounced.svelte';
	import { useIsMounted } from '$lib/hooks/useIsMounted.svelte';
	import SelectRecipeType from './SelectRecipeType.svelte';
	import SelectIngredient from './SelectIngredient.svelte';

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

	async function generateRecipe() {
		if (!confirm(`Generate recipe with the selected ingredients? ${ingredientImages.join(' ')}`)) {
			return;
		}

		try {
			isGenerating = true;

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

			// We just consume the stream until it's done
			const recipeContents = await res.text();
			const recipeJson = JSON.parse(recipeContents) as GeneratedRecipeType;

			if (recipeJson) {
				recipeItems.clear();
				recipeTypeStorage.remove();

				console.log(recipeJson);
				goto(`/recipes/${recipeJson.recipeId}`);
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

<div class="p-4 container mx-auto w-full h-full max-w-xl lg:max-w-3xl pt-10 sm:pt-20">
	<div class="px-4 pt-8 pb-6 flex flex-col gap-2 shadow-md rounded-xl border border-gray-200">
		<h1 class="flex flex-row gap-2 mx-auto text-2xl sm:text-4xl items-center text-orange-400">
			<SparkIcon class="size-8 sm:size-12" animated />
			<span>Generate Recipe</span>
		</h1>

		<p class="p-4 rounded-lg bg-orange-100 shadow-sm text-center">
			Select from <strong>2</strong> up to <strong>10</strong> to generate a new recipe using our AI
		</p>

		<div class="w-full mx-auto mt-10 flex flex-col items-center gap-2">
			<h2 class="font-bold font-mono text-xl self-start">Recipe</h2>
			<div class="w-full" in:scale={{ duration: 300, opacity: 0.5, start: 0.9, easing: quintOut }}>
				<SelectRecipeType
					class="w-full"
					bind:selected={recipeTypeStorage.value}
					disabled={isGenerating}
				/>
			</div>

			{#if ingredientsLoading.value}
				<div class="w-full h-full p-4 flex flex-row items-center justify-center">
					<LoadingDotsIcon class="size-10 text-orange-300" />
				</div>
			{:else if recipeTypeStorage.value}
				<h2 class="font-bold font-mono text-xl self-start mt-5">Ingredients</h2>
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
						class="w-[200px] my-5"
						transition:scale={{ duration: 300, opacity: 0.5, start: 0.3, easing: quintOut }}
					>
						<RecipeLoading images={ingredientImages} />
					</div>
				{:else}
					{#each recipeItems.selectedItems as item, index (item.id)}
						{#if mounted.value}
							<div
								class="flex flex-row items-center gap-2 w-full"
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

								<Button.Root
									disabled={isGenerating}
									class={cn(
										`bg-red-500 text-white p-2 rounded-md`,
										isGenerating ? '' : 'hover:bg-red-600',
										'disabled:opacity-70 disabled:cursor-not-allowed'
									)}
									onclick={() => recipeItems.remove(item.id)}>Remove</Button.Root
								>
							</div>
						{/if}
					{:else}
						<h3 class="text-neutral-400/90">No ingredients selected</h3>
					{/each}
				{/if}
			{/if}

			<div class="w-full flex sm:flex-row flex-col justify-between gap-2 mt-2">
				<Button.Root
					disabled={!canGenerate || isGenerating}
					onclick={generateRecipe}
					class={cn(
						`relative rounded-lg px-4 py-2 justify-center text-white w-full flex flex-row items-center gap-1 bg-neutral-700`,
						!canGenerate || isGenerating ? '' : 'hover:bg-neutral-800',
						'disabled:opacity-70 disabled:cursor-not-allowed'
					)}
				>
					{#if isGenerating}
						<LoadingIcon class="text-white size-6" />
						<span> Generating</span>
					{:else}
						<SparkIcon class="size-6" />
						<span> Generate</span>
					{/if}
				</Button.Root>

				<Button.Root
					disabled={!canPickIngredients}
					onclick={recipeItems.add}
					class={cn(
						'relative rounded-lg px-4 py-2 bg-orange-500 justify-center text-white w-full flex flex-row items-center gap-1',
						!canPickIngredients ? '' : ' hover:bg-orange-600',
						'disabled:opacity-70 disabled:cursor-not-allowed',
						{
							'animate-pulse': recipeItems.pending
						}
					)}
				>
					{#if recipeItems.pending}
						<LoadingIcon class="text-white size-6" />
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" class="text-white size-6" viewBox="0 0 24 24">
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
				</Button.Root>
			</div>
		</div>
	</div>
</div>
