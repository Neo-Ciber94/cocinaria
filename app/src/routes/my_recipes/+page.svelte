<script lang="ts">
	import CookingIcon from '$components/icons/cookingIcon.svelte';
	import type { PageData } from './$types';
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	let { data }: { data: PageData } = $props();
	let recipes = $state<PageData['recipes']>([]);
	const hasRecipes = $derived(data.recipes.length > 0);

	$effect(() => {
		recipes = Array.from(Array(30).keys())
			.flatMap(() => data.recipes)
			.map((e) => ({ ...e, id: crypto.randomUUID() }));
	});
</script>

<div class="p-4 container mx-auto w-full h-full max-w-3xl lg:max-w-5xl pt-10 sm:pt-20">
	<h1 class="flex flex-row gap-2 mx-auto text-2xl sm:text-4xl items-center text-orange-400">
		<CookingIcon class="size-8 sm:size-12" />
		<span>My Recipes</span>
	</h1>

	<div class="flex flex-row gap-4 flex-wrap py-5 justify-center">
		{#if hasRecipes}
			{#each recipes as recipe, index (recipe.id)}
				<a
					href={`/recipes/${recipe.id}`}
					class="flex flex-col gap-2 p-2 rounded-lg shadow-md border border-gray-200 w-[180px] md:w-[220px] xl:w-[300px] bg-white"
					in:scale|local={{
						duration: 500,
						opacity: 0.01,
						start: 0.5,
						easing: backOut,
						delay: index * 100
					}}
				>
					<img
						alt={recipe.name}
						src={recipe.imageUrl ?? 'https://placehold.co/400'}
						class="aspect-square"
					/>
					<h3 class="text-center font-bold text-base sm:text-lg">{recipe.name}</h3>
				</a>
			{/each}
		{:else}
			<h2 class="text-lg sm:text-xl font-bold text-center text-neutral-400">No recipes</h2>
		{/if}
	</div>
</div>
