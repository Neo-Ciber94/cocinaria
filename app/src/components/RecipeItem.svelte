<script lang="ts">
	import { NOT_FOUND_IMAGE } from '$lib/common/constants';
	import { INGREDIENTS } from '$lib/common/ingredients';
	import type { Recipe as RecipeEntity } from '$lib/db/types';
	import { useIsMounted } from '$lib/hooks/useIsMounted.svelte';
	import { cn } from '$lib/index';
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	type ImgProps = {
		width?: number;
		height?: number;
		class?: string;
	};

	type Recipe = Pick<RecipeEntity, 'id' | 'name' | 'ingredients' | 'imageUrl'>;

	type Props = { recipe: Recipe; class?: string; index?: number; imgProps?: ImgProps };

	let { recipe, imgProps, index = 0, ...rest }: Props = $props();
	const mounted = useIsMounted();

	function getIngredientImages(recipeIngredients: string[]) {
		const images = INGREDIENTS.filter((ingredient) =>
			recipeIngredients.includes(ingredient.value)
		).map((ingredient) => ingredient.image);

		return images;
	}
</script>

{#if mounted.value}
	<a
		href={`/recipes/${recipe.id}`}
		class={cn(
			'flex flex-col gap-1 p-2 rounded-lg shadow-md border border-gray-200 w-full bg-white',
			rest.class
		)}
		in:scale={{
			duration: 500,
			opacity: 0.01,
			start: 0.5,
			easing: backOut,
			delay: index * 70
		}}
	>
		<img
			width={imgProps?.width}
			height={imgProps?.height}
			class={imgProps?.class}
			alt={recipe.name}
			src={recipe.imageUrl ?? NOT_FOUND_IMAGE}
		/>

		<h3 class="text-center font-bold text-base sm:text-lg mt-1">{recipe.name}</h3>
		<small class="text-neutral-300 text-center w-full font-medium font-sans tracking-wide">
			Ingredients
		</small>
		<div class="flex flex-row gap-1 items-center w-full justify-center text-xl px-2 flex-wrap">
			{#each getIngredientImages(recipe.ingredients) as ingredientImage}
				<span>{ingredientImage}</span>
			{/each}
		</div>
	</a>
{/if}
