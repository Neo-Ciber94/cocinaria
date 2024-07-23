import { lucia } from '$lib/auth/lucia';
import { COOKIE_AI_PROVIDER_KEY } from '$lib/common/constants';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent) {
	event.cookies.delete(lucia.sessionCookieName, { path: '/' });
	event.cookies.delete(COOKIE_AI_PROVIDER_KEY, { path: '/' });

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}
