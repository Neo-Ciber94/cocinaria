import { invariant } from '$lib';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { generateRecipeImage } from '$lib/server/ai/recipe';
import { deleteRecipe, getRecipeById } from '$lib/server/recipes';
import { ApplicationError } from '$lib/common/error';
import { checkAuthenticated, getAIProviderKey } from '$lib/server/utils';

export const actions = {
	async generateImage(event) {
		const { session } = checkAuthenticated(event);
		const aiProviderKey = getAIProviderKey(event.cookies);

		try {
			const imageResult = await generateRecipeImage({
				aiProviderKey,
				userId: session.userId,
				input: {
					action: 'find-and-update',
					recipeId: event.params.recipe_id
				}
			});

			if (!imageResult) {
				fail(400, { message: 'Failed to generate image' });
			}

			return {
				url: imageResult?.imageUrl
			};
		} catch (err) {
			console.error(err);

			if (err instanceof ApplicationError) {
				fail(400, { message: err.message });
			}

			throw err;
		}
	},
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
