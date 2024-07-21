import { getUserRecipes } from '$lib/server/recipes';
import { checkAuthenticated } from '$lib/server/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { user } = checkAuthenticated(event);
	const recipes = await getUserRecipes(user.id);
	return { recipes };
};
