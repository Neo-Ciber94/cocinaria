import { dev } from '$app/environment';
import { COOKIE_AI_PROVIDER_KEY } from '$lib/common/constants';
import { checkAuthenticated } from '$lib/server/utils';
import { error, type RequestHandler } from '@sveltejs/kit';
import { aiProviderConfig } from './schema';

export const POST: RequestHandler = async (event) => {
	checkAuthenticated(event);

	try {
		const json = await event.request.json();
		const result = aiProviderConfig.safeParse(json);

		if (!result.success) {
			const message = result.error.issues
				.map((issue) => `${issue.path}: ${issue.message}`)
				.join('\n');

			error(400, { message });
		}

		event.cookies.set(COOKIE_AI_PROVIDER_KEY, JSON.stringify(result.data), {
			path: '/',
			httpOnly: true,
			secure: !dev
		});

		return new Response();
	} catch (err) {
		console.error(err);
		return Response.json({ error: 'Internal Server Error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = (event) => {
	checkAuthenticated(event);
	event.cookies.delete(COOKIE_AI_PROVIDER_KEY, { path: '/' });
	return new Response(null, { status: 204 });
};
