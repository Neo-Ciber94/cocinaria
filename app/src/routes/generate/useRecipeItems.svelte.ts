import { z } from 'zod';
import { ingredienSchema, INGREDIENTS, type Ingredient } from '$lib/common/ingredients';
import { useLocalStorage } from '$lib/hooks/useLocalStorage.svelte';

export const MIN_INGREDIENTS = 2;
export const MAX_INGREDIENTS = 10;

const itemSchema = z.object({
	id: z.string(),
	ingredient: ingredienSchema.optional()
});

export function useRecipeItems() {
	const ingredientArraySchema = z.array(itemSchema).max(MAX_INGREDIENTS);
	const items = useLocalStorage('cocinaria:generate-recipe-ingredients', ingredientArraySchema, {
		initialValue: [],
		storage: () => sessionStorage
	});

	const selectedItems = $derived.by(() => {
		return items.value as ReadonlyArray<z.infer<typeof itemSchema>>;
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

	function add() {
		if (selectedItems.length === MAX_INGREDIENTS) {
			return;
		}

		items.value.push({ ingredient: undefined, id: crypto.randomUUID() });
	}

	function remove(id: string) {
		items.value = selectedItems.filter((ingredient) => ingredient.id !== id);
	}

	function update(id: string, ingredient: Ingredient | undefined) {
		items.value = selectedItems.map((item) => {
			if (item.id === id) {
				return { ...item, ingredient };
			}

			return item;
		});
	}

	return {
		get ingredients() {
			return ingredients;
		},
		get selectedItems() {
			return selectedItems;
		},
		get pending() {
			return items.pending;
		},
		add,
		remove,
		update
	};
}
