import type { RequestEvent } from '@sveltejs/kit';

const COOKIE_FOOD_ICON = 'food-icon';
const FOOD_ICONS = ['🍕', '🍔', '🧁', '🍰', '🍊', '🍒', '🍇', '🥕', '🥦'] as const;
export type FoodIcons = (typeof FOOD_ICONS)[number];

export function getFoodIcon(event: RequestEvent) {
	const foodIconCookie = event.cookies.get(COOKIE_FOOD_ICON) as FoodIcons;

	if (FOOD_ICONS.includes(foodIconCookie)) {
		return foodIconCookie;
	}

	const icon = FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)];
	event.cookies.set(COOKIE_FOOD_ICON, icon, { path: '/' });
	return icon;
}
