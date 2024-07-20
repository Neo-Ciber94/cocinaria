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

<div class="p-4 container mx-auto w-full h-full max-w-4xl lg:max-w-6xl pt-10 sm:pt-20">
	<h1 class="flex flex-row gap-2 mx-auto text-2xl sm:text-4xl items-center text-orange-400">
		<CookingIcon class="size-8 sm:size-12" />
		<span>My Recipes</span>
	</h1>

	{#if hasRecipes}
		<div
			class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 flex-wrap py-5 justify-center"
		>
			{#each recipes as recipe, index}
				<RecipeItem {recipe} {index} imgProps={{ width: 400, height: 400 }} />
			{/each}
		</div>
	{:else}
		<h2
			class="text-xl md:text-4xl lg:text-5xl font-bold flex flex-row justify-center items-center text-neutral-400/70 h-[50vh] select-none w-full"
		>
			No recipes
		</h2>
	{/if}
</div>
