import { z } from 'zod';
import type { KeysTuple } from './typeutils';

export const INGREDIENTS_GROUPS = {
	vegetables: [
		{ value: 'tomato', image: '🍅' },
		{ value: 'lettuce', image: '🥬' },
		{ value: 'cucumber', image: '🥒' },
		{ value: 'carrot', image: '🥕' },
		{ value: 'onion', image: '🧅' },
		{ value: 'pepper', image: '🌶️' },
		{ value: 'mushroom', image: '🍄' },
		{ value: 'olive', image: '🫒' },
		{ value: 'potato', image: '🥔' },
		{ value: 'garlic', image: '🧄' },
		{ value: 'corn', image: '🌽' },
		{ value: 'bellPepper', image: '🫑' },
		{ value: 'eggplant', image: '🍆' },
		{ value: 'broccoli', image: '🥦' },
		{ value: 'ginger', image: '🫚' },
		{ value: 'pumpkin', image: '🎃' }
	],
	fruits: [
		{ value: 'avocado', image: '🥑' },
		{ value: 'lemon', image: '🍋' },
		{ value: 'apple', image: '🍎' },
		{ value: 'pear', image: '🍐' },
		{ value: 'orange', image: '🍊' },
		{ value: 'banana', image: '🍌' },
		{ value: 'watermelon', image: '🍉' },
		{ value: 'grapes', image: '🍇' },
		{ value: 'strawberry', image: '🍓' },
		{ value: 'blueberry', image: '🫐' },
		{ value: 'kiwi', image: '🥝' },
		{ value: 'coconut', image: '🥥' },
		{ value: 'peach', image: '🍑' },
		{ value: 'cherry', image: '🍒' },
		{ value: 'pineapple', image: '🍍' },
		{ value: 'mango', image: '🥭' }
	],
	dairy: [
		{ value: 'cheese', image: '🧀' },
		{ value: 'milk', image: '🥛' },
		{ value: 'butter', image: '🧈' }
	],
	meat: [
		{ value: 'bacon', image: '🥓' },
		{ value: 'beef', image: '🥩' },
		{ value: 'chicken', image: '🍗' }
	],
	fish: [
		{ value: 'fish', image: '🐟' },
		{ value: 'shrimp', image: '🍤' },
		{ value: 'squid', image: '🦑' },
		{ value: 'oyster', image: '🦪' }
	],
	nuts: [
		{ value: 'peanut', image: '🥜' },
		{ value: 'chestnut', image: '🌰' },
		{ value: 'coffee beans', image: '🫘' }
	],
	grains: [
		{ value: 'rice', image: '🍚' },
		{ value: 'wheat', image: '🌾' }
	],
	other: [
		{ value: 'egg', image: '🥚' },
		{ value: 'bread', image: '🍞' },
		{ value: 'chocolate', image: '🍫' },
		{ value: 'ice', image: '🧊' },
		{ value: 'water', image: '💧' },
		{ value: 'salt', image: '🧂' },
		{ value: 'sugar', image: '🌸' },
		{ value: 'honey', image: '🍯' }
	]
} as const;

type CategoryTypes = KeysTuple<typeof INGREDIENTS_GROUPS>;

export const ingredientCategorySchema = z.enum([
	'fish',
	'vegetables',
	'fruits',
	'dairy',
	'meat',
	'nuts',
	'grains',
	'other'
] as CategoryTypes);

export type Category = z.infer<typeof ingredientCategorySchema>;

export const ingredienSchema = z.object({
	value: z.string(),
	image: z.string(),
	category: ingredientCategorySchema
});

export type Ingredient = z.infer<typeof ingredienSchema>;

export const INGREDIENTS = Object.entries(INGREDIENTS_GROUPS)
	.map(([c, list]) => list.map((ingredient) => ({ category: c as Category, ...ingredient })))
	.flat();
