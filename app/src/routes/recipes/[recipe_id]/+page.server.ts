import { invariant } from '$lib';
import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const auth = event.locals.auth;
	invariant(auth, 'Auth is required');

	const recipe = await db.query.recipes.findFirst({
		where(fields, { and, eq }) {
			return and(eq(fields.userId, auth.user.id), eq(fields.id, event.params.recipe_id));
		}
	});

	if (!recipe) {
		error(404, { message: 'Recipe not found' });
	}

	return { recipe };
};
