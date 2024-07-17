import { invariant } from '$lib';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteRecipe, getRecipeById } from '$lib/server/recipes';

export const actions = {
	async deleteRecipe(event) {
		const auth = event.locals.auth;
		invariant(auth, 'Auth is required');

		const deleted = await deleteRecipe(event.params.recipe_id, auth.user.id);
		return { deleted };
	}
} satisfies Actions;

export const load: PageServerLoad = async (event) => {
	const auth = event.locals.auth;
	invariant(auth, 'Auth is required');

	const recipe = await getRecipeById(event.params.recipe_id);

	if (!recipe) {
		error(404, { message: 'Recipe not found' });
	}

	return { recipe };
};
