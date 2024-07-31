import { lucia } from '$lib/auth/lucia';
import { COOKIE_AI_PROVIDER_KEY } from '$lib/common/constants';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent) {
	const sessionId = event.cookies.get(lucia.sessionCookieName);

	event.cookies.delete(lucia.sessionCookieName, { path: '/' });
	event.cookies.delete(COOKIE_AI_PROVIDER_KEY, { path: '/' });

	if (sessionId) {
		try {
			await lucia.invalidateSession(sessionId);
			await lucia.deleteExpiredSessions();
		} catch (err) {
			console.error(err);
		}
	}

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}
