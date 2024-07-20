import { getRecipes } from '$lib/server/recipes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const search = event.url.searchParams.get('search');
	const ingredients = event.url.searchParams.getAll('ingredients').filter(Boolean);

	try {
		const recipes = await getRecipes({ search, ingredients });

		return {
			recipes
		};
	} catch (err) {
		console.error(err);
		return {
			error: 'Failed to get recipes',
			recipes: []
		};
	}
};
