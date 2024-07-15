import { invariant } from '$lib';
import { db } from '$lib/db';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { generateRecipeImage } from '$lib/server/ai';

export const actions = {
	async generateImage(event) {
		const auth = event.locals.auth;
		invariant(auth, 'Auth is required');

		const imageResult = await generateRecipeImage({
			userId: auth.user.id,
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
	}
} satisfies Actions;

export const load: PageServerLoad = async (event) => {
	const auth = event.locals.auth;
	invariant(auth, 'Auth is required');

	const recipe = await db.query.recipes.findFirst({
		columns: {
			prompt: false,
			recipeType: false
		},
		where(fields, { and, eq }) {
			return and(eq(fields.userId, auth.user.id), eq(fields.id, event.params.recipe_id));
		}
	});

	if (!recipe) {
		error(404, { message: 'Recipe not found' });
	}

	return { recipe };
};
