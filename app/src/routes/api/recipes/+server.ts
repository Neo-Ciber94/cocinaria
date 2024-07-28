import { rateLimiter } from '$lib/server/ratelimiter';
import { getRecipes } from '$lib/server/recipes';
import { checkAuthenticated } from '$lib/server/utils';
import { error, type RequestHandler } from '@sveltejs/kit';
import { stringify } from 'devalue';

export const GET: RequestHandler = async (event) => {
	const auth = checkAuthenticated(event);

	const limiterResult = await rateLimiter.limit(event, auth.user.id);

	if (!limiterResult.success) {
		error(429, { message: 'Too many requests' });
	}

	const search = event.url.searchParams.get('search');
	const ingredients = event.url.searchParams.getAll('ingredients').filter(Boolean);
	const cursor = event.url.searchParams.get('cursor');

	try {
		const result = await getRecipes({ search, ingredients, cursor });
		return devalueJson(result);
	} catch (err) {
		console.error(err);
		error(400, 'Failed to get recipes');
	}
};

function devalueJson(data: unknown, init?: ResponseInit) {
	const json = stringify(data);
	return new Response(json, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...init?.headers
		}
	});
}
