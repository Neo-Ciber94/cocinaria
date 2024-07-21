import { dev } from '$app/environment';
import { getLatestRecipes } from '$lib/server/recipes';
import type { PageServerLoad } from './$types';

const CACHE_SECONDS = 60 * 5; // 5min

export const load: PageServerLoad = async (event) => {
	try {
		const recipes = await getLatestRecipes();

		if (!dev) {
			event.setHeaders({
				'Cache-Control': `public, max-age=${CACHE_SECONDS}`
			});
		}

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
