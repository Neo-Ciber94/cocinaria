<script lang="ts">
	import CookingIcon from '$components/icons/cookingIcon.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="p-4 container mx-auto w-full h-full max-w-xl lg:max-w-3xl pt-10 sm:pt-20">
	<h1 class="flex flex-row gap-2 mx-auto text-2xl sm:text-4xl items-center text-orange-400">
		<CookingIcon class="size-8 sm:size-12" />
		<span>My Recipes</span>
	</h1>

	<div class="flex flex-row gap-4 flex-wrap py-5">
		{#each data.recipes as recipe}
			<a
				href={`/recipes/${recipe.id}`}
				class="flex flex-col gap-2 p-2 rounded-lg shadow-md border border-gray-200"
			>
				<img
					alt={recipe.name}
					src={recipe.imageUrl ?? 'https://placehold.co/400'}
					class="aspect-square"
				/>
				<h3 class="text-center font-bold text-lg">{recipe.name}</h3>
			</a>
		{:else}
			<h3 class="mx-auto font-bold text-2xl text-neutral-400">Not recipes</h3>
		{/each}
	</div>
</div>
