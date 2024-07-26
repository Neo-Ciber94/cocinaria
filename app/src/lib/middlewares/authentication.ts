import { invariant } from '$lib';
import { getAuth } from '$lib/auth/utils';
import type { Auth } from '$lib/common/types';
import { db } from '$lib/db';

import type { Handle, RequestEvent } from '@sveltejs/kit';

const PUBLIC_ROUTES = ['/', '/login', '/manifest.json', /^\/recipes\/(.+)/];

export function authentication(): Handle {
	function isPublic(pathname: string) {
		if (pathname.length > 1 && pathname.endsWith('/')) {
			pathname = pathname.slice(0, -1);
		}

		for (const p of PUBLIC_ROUTES) {
			if (p instanceof RegExp && p.test(pathname)) {
				return true;
			} else if (p === pathname) {
				return true;
			}
		}

		return false;
	}

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
		if (auth == null && !isPublic(pathname)) {
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

async function createAuthSession(event: RequestEvent): Promise<Auth | null> {
	const auth = await getAuth(event.cookies);

	if (!auth) {
		return null;
	}

	const account = await db.query.accounts.findFirst({
		where(fields, { eq }) {
			return eq(fields.userId, auth.user.id);
		}
	});

	// This should never happen, each user is required to have an account associated to it
	invariant(account, 'auth account not found');
	return { ...auth, account };
}
