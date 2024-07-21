<script lang="ts">
	import CookingIcon from '$components/icons/cookingIcon.svelte';
	import RecipeItem from '$components/RecipeItem.svelte';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let recipes = $state<PageData['recipes']>([]);

	const hasRecipes = $derived(data.recipes.length > 0);

	// We do this to trigger entry transitions
	$effect(() => {
		recipes = data.recipes;
	});
</script>

<SvelteSeo title={(baseTitle) => `${baseTitle} | My Recipes`} />

<div class="container mx-auto h-full w-full max-w-4xl p-4 pt-10 sm:pt-20 lg:max-w-6xl">
	<h1 class="mx-auto flex flex-row items-center gap-2 text-2xl text-orange-400 sm:text-4xl">
		<CookingIcon class="size-8 sm:size-12" />
		<span>My Recipes</span>
	</h1>

	{#if hasRecipes}
		<div
			class="grid grid-cols-1 flex-wrap justify-center gap-4 py-5 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
		>
			{#each recipes as recipe, index}
				<RecipeItem {recipe} {index} imgProps={{ width: 400, height: 400 }} />
			{/each}
		</div>
	{:else}
		<h2
			class="flex h-[50vh] w-full select-none flex-row items-center justify-center text-xl font-bold text-neutral-400/70 md:text-4xl lg:text-5xl"
		>
			No recipes
		</h2>
	{/if}
</div>
