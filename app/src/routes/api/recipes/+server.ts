import { getRecipes } from '$lib/server/recipes';
import { error, type RequestHandler } from '@sveltejs/kit';
import { stringify } from 'devalue';

export const GET: RequestHandler = async (event) => {
	const search = event.url.searchParams.get('search');
	const ingredients = event.url.searchParams.getAll('ingredients').filter(Boolean);
	const cursor = event.url.searchParams.get('cursor');

	try {
		const result = await getRecipes({ search, ingredients, cursor });
		return devalueJson(result);
	} catch (err) {
		console.log(err);
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
