<script lang="ts">
	import CookingIcon from '$components/icons/cookingIcon.svelte';
	import { INGREDIENTS } from '$lib/common/ingredients';
	import type { PageData } from './$types';
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	let { data }: { data: PageData } = $props();
	let recipes = $state<PageData['recipes']>([]);
	const hasRecipes = $derived(data.recipes.length > 0);

	// We do this to trigger entry transitions
	$effect(() => {
		recipes = Array.from(Array(30).keys())
			.flatMap(() => data.recipes)
			.map((e) => ({ ...e }));
	});

	function getIngredientImages(recipeIngredients: string[]) {
		const images = INGREDIENTS.filter((ingredient) =>
			recipeIngredients.includes(ingredient.value)
		).map((ingredient) => ingredient.image);

		return images;
	}
</script>

<div class="p-4 container mx-auto w-full h-full max-w-4xl lg:max-w-6xl pt-10 sm:pt-20">
	<h1 class="flex flex-row gap-2 mx-auto text-2xl sm:text-4xl items-center text-orange-400">
		<CookingIcon class="size-8 sm:size-12" />
		<span>My Recipes</span>
	</h1>

	<div
		class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 flex-wrap py-5 justify-center"
	>
		{#if hasRecipes}
			{#each recipes as recipe, index}
				<a
					href={`/recipes/${recipe.id}`}
					class="flex flex-col gap-1 p-2 rounded-lg shadow-md border border-gray-200 w-full bg-white"
					in:scale|local={{
						duration: 500,
						opacity: 0.01,
						start: 0.5,
						easing: backOut,
						delay: index * 100
					}}
				>
					<img alt={recipe.name} src={recipe.imageUrl ?? 'https://placehold.co/400'} />

					<h3 class="text-center font-bold text-base sm:text-lg mt-1">{recipe.name}</h3>
					<small class="text-neutral-300 text-center w-full font-medium font-sans tracking-wide">
						Ingredients
					</small>
					<div
						class="flex flex-row gap-1 items-center w-full justify-center text-xl px-2 flex-wrap"
					>
						{#each getIngredientImages(recipe.ingredients) as ingredientImage}
							<span>{ingredientImage}</span>
						{/each}
					</div>
				</a>
			{/each}
		{:else}
			<h2
				class="text-xl md:text-4xl lg:text-5xl font-bold flex flex-row justify-center items-center text-neutral-400/70 h-[50vh] select-none"
			>
				No recipes
			</h2>
		{/if}
	</div>
</div>
