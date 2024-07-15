import { z } from 'zod';

export const ingredientCategorySchema = z.enum([
	'meat',
	'vegetable',
	'fish',
	'fruit',
	'dairy',
	'grain',
	'nut',
	'other'
]);

export const ingredienSchema = z.object({
	value: z.string(),
	image: z.string(),
	category: ingredientCategorySchema
});

export type Ingredient = z.infer<typeof ingredienSchema>;

export const INGREDIENTS: Ingredient[] = [
	{ value: 'tomato', image: '🍅', category: 'vegetable' },
	{ value: 'lettuce', image: '🥬', category: 'vegetable' },
	{ value: 'cheese', image: '🧀', category: 'dairy' },
	{ value: 'bacon', image: '🥓', category: 'meat' },
	{ value: 'egg', image: '🥚', category: 'other' },
	{ value: 'avocado', image: '🥑', category: 'fruit' },
	{ value: 'cucumber', image: '🥒', category: 'vegetable' },
	{ value: 'carrot', image: '🥕', category: 'vegetable' },
	{ value: 'onion', image: '🧅', category: 'vegetable' },
	{ value: 'pepper', image: '🌶️', category: 'vegetable' },
	{ value: 'mushroom', image: '🍄', category: 'vegetable' },
	{ value: 'olive', image: '🫒', category: 'vegetable' },
	{ value: 'potato', image: '🥔', category: 'vegetable' },
	{ value: 'garlic', image: '🧄', category: 'vegetable' },
	{ value: 'corn', image: '🌽', category: 'vegetable' },
	{ value: 'lemon', image: '🍋', category: 'fruit' },
	{ value: 'meat', image: '🥩', category: 'meat' },
	{ value: 'chicken', image: '🍗', category: 'meat' },
	{ value: 'fish', image: '🐟', category: 'fish' },
	{ value: 'apple', image: '🍎', category: 'fruit' },
	{ value: 'pear', image: '🍐', category: 'fruit' },
	{ value: 'orange', image: '🍊', category: 'fruit' },
	{ value: 'banana', image: '🍌', category: 'fruit' },
	{ value: 'watermelon', image: '🍉', category: 'fruit' },
	{ value: 'grapes', image: '🍇', category: 'fruit' },
	{ value: 'strawberry', image: '🍓', category: 'fruit' },
	{ value: 'blueberry', image: '🫐', category: 'fruit' },
	{ value: 'kiwi', image: '🥝', category: 'fruit' },
	{ value: 'coconut', image: '🥥', category: 'fruit' },
	{ value: 'peach', image: '🍑', category: 'fruit' },
	{ value: 'cherry', image: '🍒', category: 'fruit' },
	{ value: 'pineapple', image: '🍍', category: 'fruit' },
	{ value: 'mango', image: '🥭', category: 'fruit' },
	{ value: 'eggplant', image: '🍆', category: 'vegetable' },
	{ value: 'broccoli', image: '🥦', category: 'vegetable' },
	{ value: 'peanut', image: '🥜', category: 'nut' },
	{ value: 'chestnut', image: '🌰', category: 'nut' },
	{ value: 'rice', image: '🍚', category: 'grain' },
	{ value: 'pumpkin', image: '🎃', category: 'vegetable' },
	{ value: 'milk', image: '🥛', category: 'dairy' },
	{ value: 'butter', image: '🧈', category: 'dairy' },
	{ value: 'shrimp', image: '🍤', category: 'fish' },
	{ value: 'squid', image: '🦑', category: 'fish' },
	{ value: 'oyster', image: '🦪', category: 'fish' },
	{ value: 'wheat', image: '🌾', category: 'grain' },
	{ value: 'bread', image: '🍞', category: 'other' },
	{ value: 'chocolate', image: '🍫', category: 'other' },
	{ value: 'ice', image: '🧊', category: 'other' },
	{ value: 'water', image: '💧', category: 'other' },
	{ value: 'salt', image: '🧂', category: 'other' },
	{ value: 'bellPepper', image: '🫑', category: 'vegetable' }
];
