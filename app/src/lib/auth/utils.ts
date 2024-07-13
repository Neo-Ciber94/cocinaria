import type { Cookies } from '@sveltejs/kit';
import { lucia } from './lucia';

export async function getAuth(cookies: Cookies) {
	const sessionCookie = cookies.get(lucia.sessionCookieName);

	if (!sessionCookie) {
		return null;
	}

	const userSession = await lucia.validateSession(sessionCookie);

	if (userSession.session == null || userSession.user == null) {
		return null;
	}

	return userSession;
}
