import { invariant } from '$lib';
import { getUserRecipes } from '$lib/server/recipes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const auth = event.locals.auth;
	invariant(auth, 'Auth is required');

	const recipes = await getUserRecipes(auth.user.id);
	return { recipes };
};
