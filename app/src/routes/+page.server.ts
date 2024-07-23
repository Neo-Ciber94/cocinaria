import { getLatestRecipes } from '$lib/server/recipes';
import { shuffleArrayInPlace } from '$lib/utils/arrays';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const recipes = await getLatestRecipes();

		shuffleArrayInPlace(recipes);

		return {
			recipes
		};
	} catch (err) {
		console.error(err);
		return {
			recipes: []
		};
	}
};
