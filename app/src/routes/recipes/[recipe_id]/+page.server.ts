import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteRecipe, getRecipeById } from '$lib/server/recipes';
import { checkAuthenticated } from '$lib/server/utils';
import { getBaseUrl } from '$lib/common/getBaseUrl';

export const actions = {
	async deleteRecipe(event) {
		const { user } = checkAuthenticated(event);
		const deleted = await deleteRecipe(event.params.recipe_id, user.id);
		return { deleted };
	}
} satisfies Actions;

export const load: PageServerLoad = async (event) => {
	const recipe = await getRecipeById(event.params.recipe_id);

	if (!recipe) {
		error(404, { message: 'Recipe not found' });
	}

	const recipeUrl = `${getBaseUrl()}/recipes/${recipe.id}`;

	return {
		recipe,
		seo: {
			recipeUrl
		}
	};
};
