import { getFoodIcon } from '$lib/hooks/foodIcon';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = event.locals.session?.user;
	const icon = getFoodIcon(event);

	return { user, icon };
};
