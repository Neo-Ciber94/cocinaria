import { lucia } from '$lib/auth/lucia';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent) {
	event.cookies.delete(lucia.sessionCookieName, { path: '/' });

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}
