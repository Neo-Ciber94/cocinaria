import { getRecipes } from '$lib/server/recipes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const recipes = await getRecipes();

	return {
		recipes
	};
};
