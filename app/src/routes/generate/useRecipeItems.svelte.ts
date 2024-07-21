import { z } from 'zod';
import { getIngredients, ingredienSchema, type Ingredient } from '$lib/common/ingredients';
import { useLocalStorage } from '$lib/hooks/useLocalStorage.svelte';
import { MAX_RECIPE_INGREDIENTS } from '$lib/common/constants';

const itemSchema = z.object({
	id: z.string(),
	ingredient: ingredienSchema.optional()
});

const ingredientArraySchema = z.array(itemSchema).max(MAX_RECIPE_INGREDIENTS);

export function useRecipeItems(initial?: z.infer<typeof ingredientArraySchema>) {
	const initialIngredients = getIngredients({ shuffle: true });
	const recipeStorage = useLocalStorage(
		'cocinaria:generate-recipe-ingredients',
		ingredientArraySchema,
		{
			initialValue: initial,
			storage: () => sessionStorage
		}
	);

	const selectedItems = $derived.by(() => {
		return recipeStorage.value as ReadonlyArray<z.infer<typeof itemSchema>>;
	});

	const remainingIngredients = $derived.by(() => {
		const selectedIngredients = selectedItems
			.map((s) => s.ingredient)
			.filter(Boolean) as Ingredient[];

		return initialIngredients.filter((ingredient) => {
			const isAlreadyAdded = selectedIngredients.some((e) => e.value === ingredient.value);
			return !isAlreadyAdded;
		});
	});

	function add() {
		if (selectedItems.length === MAX_RECIPE_INGREDIENTS) {
			return;
		}

		recipeStorage.value.push({ ingredient: undefined, id: crypto.randomUUID() });
	}

	function remove(id: string) {
		recipeStorage.value = selectedItems.filter((ingredient) => ingredient.id !== id);
	}

	function update(id: string, ingredient: Ingredient | undefined) {
		recipeStorage.value = selectedItems.map((item) => {
			if (item.id === id) {
				return { ...item, ingredient };
			}

			return item;
		});

		// Check if we can push a new ingredient to the list
		const canPushNewIngredients = selectedItems.every((e) => e.ingredient != null);
		if (canPushNewIngredients && ingredient != null) {
			add();
		}
	}

	function clear() {
		recipeStorage.remove();
	}

	return {
		get remainingIngredients() {
			return remainingIngredients;
		},
		get selectedItems() {
			return selectedItems;
		},
		get pending() {
			return recipeStorage.pending;
		},
		add,
		remove,
		update,
		clear
	};
}
