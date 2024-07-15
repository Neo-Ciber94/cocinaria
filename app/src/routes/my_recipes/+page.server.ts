import { invariant } from '$lib';
import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const auth = event.locals.auth;
	invariant(auth, 'Auth is required');

	const recipes = await db.query.recipes.findMany({
		columns: {
			id: true,
			userId: true,
			name: true,
			imageUrl: true,
			createdAt: true,
			ingredients: true
		},
		where(fields, { and, eq }) {
			return and(eq(fields.userId, auth.user.id));
		}
	});

	return { recipes };
};
