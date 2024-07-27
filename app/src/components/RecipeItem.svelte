<script lang="ts">
	import { handleImageError } from '$lib/client/handleImageError';
	import { NOT_FOUND_IMAGE } from '$lib/common/constants';
	import { INGREDIENTS } from '$lib/common/ingredients';
	import type { Recipe as RecipeEntity } from '$lib/db/types';
	import { useIsMounted } from '$lib/hooks/useIsMounted.svelte';
	import { cn } from '$lib/utils';
	import { capitalize } from '$lib/utils/strings';
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import RecipeImage from './RecipeImage.svelte';

	type ImgProps = {
		width?: number;
		height?: number;
		class?: string;
	};

	type Recipe = Pick<RecipeEntity, 'id' | 'name' | 'ingredients' | 'imageUrl'>;

	type Props = {
		recipe: Recipe;
		class?: string;
		transition?: boolean;
		index?: number;
		imgProps?: ImgProps;
	};

	let { recipe, imgProps, transition = true, index = 0, ...rest }: Props = $props();
	const mounted = useIsMounted();

	function getIngredientImages(recipeIngredients: string[]) {
		const images = INGREDIENTS.filter((ingredient) =>
			recipeIngredients.includes(ingredient.value)
		).map((ingredient) => {
			return {
				name: ingredient.value,
				image: ingredient.image
			};
		});

		return images;
	}
</script>

{#if mounted.value || !transition}
	<a
		href={`/recipes/${recipe.id}`}
		class={cn(
			'flex w-full flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-md',
			rest.class
		)}
		in:scale={{
			duration: 500,
			opacity: 0.01,
			start: 0.5,
			easing: backOut,
			delay: index * 70
		}}
		onclick={(e) => {
			const img = e.currentTarget.querySelector('img')!;
			img.style.viewTransitionName = `recipe-${recipe.id}`;
		}}
	>
		<div style:position="relative">
			<RecipeImage
				data-img
				width={imgProps?.width}
				height={imgProps?.height}
				class={imgProps?.class}
				alt={recipe.name}
				src={recipe.imageUrl ?? NOT_FOUND_IMAGE}
				onerror={handleImageError}
			/>
		</div>

		<h3 class="mt-1 text-center text-sm font-bold xxs:text-base xs:text-lg">
			{recipe.name}
		</h3>
		<small class="w-full text-center font-sans font-medium tracking-wide text-neutral-300">
			Ingredients
		</small>
		<div class="flex w-full flex-row flex-wrap items-center justify-center gap-1 px-2 text-xl">
			{#each getIngredientImages(recipe.ingredients) as ingredientImg}
				<span title={capitalize(ingredientImg.name)}>{ingredientImg.image}</span>
			{/each}
		</div>
	</a>
{/if}
