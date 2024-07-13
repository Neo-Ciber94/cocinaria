import { invariant } from '$lib';
import { getAuth } from '$lib/auth/utils';
import { db } from '$lib/db';
import type { Handle, RequestEvent } from '@sveltejs/kit';

const PUBLIC_ROUTES = ['/', '/login'];

export function authentication(): Handle {
	return async ({ event, resolve }) => {
		const pathname = event.url.pathname;
		const auth = await createAuthSession(event);
		event.locals.auth = auth;

		// There is not point for an authenticated user to enter to /login again
		if (pathname === '/login' && auth) {
			return new Response(null, {
				status: 303,
				headers: {
					Location: '/'
				}
			});
		}

		// API routes handle authentication by their own
		if (/^\/api\//.test(pathname)) {
			return resolve(event);
		}

		// If the user is not authenticated we send it to the /login
		if (auth == null && !PUBLIC_ROUTES.includes(pathname)) {
			return new Response(null, {
				status: 303,
				headers: {
					Location: '/login'
				}
			});
		}

		return resolve(event);
	};
}

async function createAuthSession(event: RequestEvent) {
	const auth = await getAuth(event.cookies);

	if (!auth) {
		return null;
	}

	const account = await db.query.accounts.findFirst({
		where(fields, { eq }) {
			return eq(fields.userId, auth.user.id);
		},
		columns: {
			authProvider: true
		}
	});

	// This should never happen, each user is required to have an account associated to it
	invariant(account, 'auth account not found');
	return { ...auth, authProvider: account.authProvider };
}
