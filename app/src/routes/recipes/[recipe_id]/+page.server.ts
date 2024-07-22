import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteRecipe, getRecipeById } from '$lib/server/recipes';
import { dev } from '$app/environment';
import { checkAuthenticated } from '$lib/server/utils';
import { getBaseUrl } from '$lib/common/getBaseUrl';

export const actions = {
	async deleteRecipe(event) {
		const { user } = checkAuthenticated(event);
		const deleted = await deleteRecipe(event.params.recipe_id, user.id);
		return { deleted };
	}
} satisfies Actions;

const RECIPE_CACHE_SECONDS = 60 * 2; // 2min

export const load: PageServerLoad = async (event) => {
	const recipe = await getRecipeById(event.params.recipe_id);

	if (!recipe) {
		error(404, { message: 'Recipe not found' });
	}

	if (!dev) {
		const auth = event.locals.auth;

		// We don't set cache headers if the user generated the recipe
		if (auth && auth.user.id !== recipe.userId) {
			event.setHeaders({
				'Cache-Control': `public; max-age=${RECIPE_CACHE_SECONDS}`
			});
		}
	}

	const recipeUrl = `${getBaseUrl()}/recipes/${recipe.id}`;

	return {
		recipe,
		seo: {
			recipeUrl
		}
	};
};
