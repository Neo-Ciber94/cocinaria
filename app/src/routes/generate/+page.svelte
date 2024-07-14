<script lang="ts">
	import SparkIcon from '$components/icons/sparkIcon.svelte';
	import { Button } from 'bits-ui';
	import IngredientSelect from './IngredientSelect.svelte';
	import { quintOut } from 'svelte/easing';
	import { fly, scale } from 'svelte/transition';
	import AmountIndicator from './AmountIndicator.svelte';
	import { useRecipeItems, MIN_INGREDIENTS, MAX_INGREDIENTS } from './useRecipeItems.svelte';
	import LoadingIcon from '$components/icons/loadingIcon.svelte';
	import { cn } from '$lib';

	const recipeItems = useRecipeItems();
	const selectedCount = $derived.by(() => {
		return recipeItems.selectedItems.filter((e) => Boolean(e.ingredient)).length;
	});

	const canGenerate = $derived.by(() => {
		return selectedCount >= MIN_INGREDIENTS;
	});
</script>

<div class="p-4 container mx-auto w-full h-full flex flex-col gap-2 max-w-xl pt-10 sm:pt-20">
	<h1 class="flex flex-row gap-2 mx-auto text-2xl sm:text-4xl items-center text-orange-400">
		<SparkIcon class="size-8 sm:size-12" />
		<span>Generate Recipe</span>
	</h1>

	<p class="p-4 rounded-lg bg-orange-100 shadow-sm text-center">
		Select from <strong>2</strong> up to <strong>10</strong> to generate a new recipe using our AI
	</p>

	<div class="w-full mx-auto mt-10 flex flex-col items-center gap-2">
		<h2 class="font-bold font-mono text-xl">Ingredients</h2>

		{#if selectedCount > 0}
			<div
				class="w-full"
				transition:scale={{ duration: 300, opacity: 0.2, start: 0.8, easing: quintOut }}
			>
				<AmountIndicator min={MIN_INGREDIENTS} max={MAX_INGREDIENTS} count={selectedCount} />
			</div>
		{/if}

		{#each recipeItems.selectedItems as item (item.id)}
			<div
				class="flex flex-row items-center gap-2 w-full"
				transition:fly={{
					duration: 300,
					x: -100,
					opacity: 0.1,
					easing: quintOut
				}}
			>
				<IngredientSelect
					class="w-full"
					ingredients={recipeItems.ingredients}
					selectedIngredient={item.ingredient}
					onchange={(ingredient) => recipeItems.update(item.id, ingredient)}
				/>

				<button
					class="bg-red-500 text-white p-2 rounded-md"
					onclick={() => recipeItems.remove(item.id)}>Remove</button
				>
			</div>
		{/each}

		<div class="w-full flex flex-row justify-between gap-2 mt-2">
			<Button.Root
				disabled={!canGenerate}
				class={cn(
					`relative rounded-lg px-4 py-2 justify-center text-white w-full flex flex-row items-center gap-1 bg-neutral-700 
                    ${canGenerate ? 'hover:bg-neutral-800' : ''} `,
					'disabled:opacity-70 disabled:cursor-not-allowed'
				)}
			>
				<SparkIcon class="size-6" />
				Generate
			</Button.Root>

			<Button.Root
				onclick={recipeItems.add}
				class={cn(
					'relative rounded-lg px-4 py-2 bg-orange-500 hover:bg-orange-600 justify-center text-white w-full flex flex-row items-center gap-1',
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
