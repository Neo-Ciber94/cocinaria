<script lang="ts">
	import SparkIcon from '$components/icons/sparkIcon.svelte';
	import { Button } from 'bits-ui';
	import { INGREDIENTS, type Ingredient } from './ingredients';
	import IngredientSelect from './IngredientSelect.svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { fade } from 'svelte/transition';

	type Item = {
		id: string;
		ingredient: Ingredient | undefined;
	};

	const MIN_INGREDIENTS = 2;
	const MAX_INGREDIENTS = 10;

	let selectedItems = $state<Item[]>([]);

	let ingredients = $derived.by(() => {
		const selectedIngredients = selectedItems
			.map((s) => s.ingredient)
			.filter(Boolean) as Ingredient[];
		return INGREDIENTS.filter((ingredient) => {
			const isAlreadyAdded = selectedIngredients.some((e) => e.value === ingredient.value);
			return !isAlreadyAdded;
		});
	});

	function addIngredient() {
		if (selectedItems.length === MAX_INGREDIENTS) {
			return;
		}

		selectedItems.push({ ingredient: undefined, id: crypto.randomUUID() });
	}

	function removeIngredient(id: string) {
		selectedItems = selectedItems.filter((ingredient) => ingredient.id !== id);
	}

	function handleChangeIngredient(id: string, ingredient: Ingredient | undefined) {
		selectedItems = selectedItems.map((item) => {
			if (item.id === id) {
				return { ...item, ingredient };
			}

			return item;
		});
	}
</script>

<div class="p-4 container mx-auto w-full h-full flex flex-col gap-2 max-w-xl">
	<h1 class="flex flex-row gap-2 mx-auto text-2xl sm:text-4xl items-center text-orange-400">
		<SparkIcon class="size-8 sm:size-12" />
		<span>Generate Recipe</span>
	</h1>

	<div class="w-full mx-auto mt-10 flex flex-col items-center gap-2">
		<h2 class="font-bold font-mono text-xl">Ingredients</h2>

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
