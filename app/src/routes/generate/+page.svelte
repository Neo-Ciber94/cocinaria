<script lang="ts">
	import SparkIcon from '$components/icons/sparkIcon.svelte';
	import { Button } from 'bits-ui';
	import { ingredienSchema, INGREDIENTS, type Ingredient } from './ingredients';
	import IngredientSelect from './IngredientSelect.svelte';
	import { quintOut } from 'svelte/easing';
	import { fly, scale } from 'svelte/transition';
	import AmountIndicator from './AmountIndicator.svelte';
	import { useLocalStorage } from '$lib/hooks/useLocalStorage.svelte';
	import { z } from 'zod';

	type Item = {
		id: string;
		ingredient: Ingredient | undefined;
	};

	const MIN_INGREDIENTS = 2;
	const MAX_INGREDIENTS = 10;

	const itemSchema = z.object({
		id: z.string(),
		ingredient: ingredienSchema.optional()
	});

	const ingredientArraySchema = z.array(itemSchema).max(MAX_INGREDIENTS);
	const items = useLocalStorage('cocineria-ingredients', ingredientArraySchema, {
		initialValue: [],
		storage: () => sessionStorage
	});

	const selectedItems = $derived.by(() => {
		return items.value as ReadonlyArray<z.infer<typeof itemSchema>>;
	});

	$effect(() => {
		console.log(selectedItems);
	});

	const ingredients = $derived.by(() => {
		const selectedIngredients = selectedItems
			.map((s) => s.ingredient)
			.filter(Boolean) as Ingredient[];
		return INGREDIENTS.filter((ingredient) => {
			const isAlreadyAdded = selectedIngredients.some((e) => e.value === ingredient.value);
			return !isAlreadyAdded;
		});
	});

	const selectedCount = $derived.by(
		() => selectedItems.filter((e) => Boolean(e.ingredient)).length
	);

	function addIngredient() {
		if (selectedItems.length === MAX_INGREDIENTS) {
			return;
		}

		items.value.push({ ingredient: undefined, id: crypto.randomUUID() });
	}

	function removeIngredient(id: string) {
		items.value = selectedItems.filter((ingredient) => ingredient.id !== id);
	}

	function handleChangeIngredient(id: string, ingredient: Ingredient | undefined) {
		items.value = selectedItems.map((item) => {
			if (item.id === id) {
				return { ...item, ingredient };
			}

			return item;
		});
	}
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

		{#each selectedItems as item (item.id)}
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
					{ingredients}
					selectedIngredient={item.ingredient}
					onchange={(ingredient) => handleChangeIngredient(item.id, ingredient)}
				/>

				<button
					class="bg-red-500 text-white p-2 rounded-md"
					onclick={() => removeIngredient(item.id)}>Delete</button
				>
			</div>
		{/each}

		<Button.Root
			onclick={addIngredient}
			class="rounded-lg px-4 py-2 bg-orange-500 text-white w-full">Add Ingredient</Button.Root
		>
	</div>
</div>
