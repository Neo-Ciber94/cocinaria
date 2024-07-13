import { getContext, setContext } from 'svelte';
import type { FoodIcons } from './foodIcon';

const FOOD_ICON_CONTEXT = Symbol('FOOD_ICON_CONTEXT');

export function setFoodIcon(icon: FoodIcons) {
	return setContext(FOOD_ICON_CONTEXT, icon);
}

export function useFoodIcon() {
	return getContext(FOOD_ICON_CONTEXT) as ReturnType<typeof setFoodIcon>;
}
