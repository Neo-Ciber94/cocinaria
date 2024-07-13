import { getFoodIcon } from '$lib/hooks/foodIcon';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const auth = event.locals.auth;
	const icon = getFoodIcon(event);
	return { auth, icon };
};
