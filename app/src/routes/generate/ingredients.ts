export type IngredientCategory =
	| 'meat'
	| 'vegetable'
	| 'fish'
	| 'fruit'
	| 'dairy'
	| 'grain'
	| 'nut'
	| 'other';

export interface Ingredient {
	name: string;
	label: string;
	category: IngredientCategory;
}

export const INGREDIENTS: Ingredient[] = [
	{ name: 'tomato', label: '🍅 Tomato', category: 'vegetable' },
	{ name: 'lettuce', label: '🥬 Lettuce', category: 'vegetable' },
	{ name: 'cheese', label: '🧀 Cheese', category: 'dairy' },
	{ name: 'bacon', label: '🥓 Bacon', category: 'meat' },
	{ name: 'egg', label: '🥚 Egg', category: 'other' },
	{ name: 'avocado', label: '🥑 Avocado', category: 'fruit' },
	{ name: 'cucumber', label: '🥒 Cucumber', category: 'vegetable' },
	{ name: 'carrot', label: '🥕 Carrot', category: 'vegetable' },
	{ name: 'onion', label: '🧅 Onion', category: 'vegetable' },
	{ name: 'pepper', label: '🌶️ Pepper', category: 'vegetable' },
	{ name: 'mushroom', label: '🍄 Mushroom', category: 'vegetable' },
	{ name: 'olive', label: '🫒 Olive', category: 'vegetable' },
	{ name: 'potato', label: '🥔 Potato', category: 'vegetable' },
	{ name: 'garlic', label: '🧄 Garlic', category: 'vegetable' },
	{ name: 'corn', label: '🌽 Corn', category: 'vegetable' },
	{ name: 'lemon', label: '🍋 Lemon', category: 'fruit' },
	{ name: 'meat', label: '🥩 Meat', category: 'meat' },
	{ name: 'chicken', label: '🍗 Chicken', category: 'meat' },
	{ name: 'fish', label: '🐟 Fish', category: 'fish' },
	{ name: 'apple', label: '🍎 Apple', category: 'fruit' },
	{ name: 'pear', label: '🍐 Pear', category: 'fruit' },
	{ name: 'orange', label: '🍊 Orange', category: 'fruit' },
	{ name: 'banana', label: '🍌 Banana', category: 'fruit' },
	{ name: 'watermelon', label: '🍉 Watermelon', category: 'fruit' },
	{ name: 'grapes', label: '🍇 Grapes', category: 'fruit' },
	{ name: 'strawberry', label: '🍓 Strawberry', category: 'fruit' },
	{ name: 'blueberry', label: '🫐 Blueberry', category: 'fruit' },
	{ name: 'kiwi', label: '🥝 Kiwi', category: 'fruit' },
	{ name: 'coconut', label: '🥥 Coconut', category: 'fruit' },
	{ name: 'peach', label: '🍑 Peach', category: 'fruit' },
	{ name: 'cherry', label: '🍒 Cherry', category: 'fruit' },
	{ name: 'pineapple', label: '🍍 Pineapple', category: 'fruit' },
	{ name: 'mango', label: '🥭 Mango', category: 'fruit' },
	{ name: 'eggplant', label: '🍆 Eggplant', category: 'vegetable' },
	{ name: 'broccoli', label: '🥦 Broccoli', category: 'vegetable' },
	{ name: 'peanut', label: '🥜 Peanut', category: 'nut' },
	{ name: 'chestnut', label: '🌰 Chestnut', category: 'nut' },
	{ name: 'rice', label: '🍚 Rice', category: 'grain' },
	{ name: 'pumpkin', label: '🎃 Pumpkin', category: 'vegetable' },
	{ name: 'milk', label: '🥛 Milk', category: 'dairy' },
	{ name: 'butter', label: '🧈 Butter', category: 'dairy' },
	{ name: 'shrimp', label: '🍤 Shrimp', category: 'fish' },
	{ name: 'squid', label: '🦑 Squid', category: 'fish' },
	{ name: 'oyster', label: '🦪 Oyster', category: 'fish' },
	{ name: 'ice', label: '🧊 Ice', category: 'other' },
	{ name: 'water', label: '💧 Water', category: 'other' },
	{ name: 'salt', label: '🧂 Salt', category: 'other' },
	{ name: 'bellPepper', label: '🫑 Bell Pepper', category: 'vegetable' }
];
