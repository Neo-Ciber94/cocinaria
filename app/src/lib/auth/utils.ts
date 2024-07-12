import type { RequestEvent } from '@sveltejs/kit';
import { lucia } from './lucia';

export async function getSession(event: RequestEvent) {
	const sessionCookie = event.cookies.get(lucia.sessionCookieName);

	if (!sessionCookie) {
		return null;
	}

	const userSession = await lucia.validateSession(sessionCookie);

	if (userSession.session == null || userSession.user == null) {
		return null;
	}

	return userSession;
}
