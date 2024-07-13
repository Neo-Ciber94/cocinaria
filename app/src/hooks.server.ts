import { getAuth } from '$lib/auth/utils';
import { db } from '$lib/db';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { invariant } from '$lib';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.auth = await createAuthSession(event);
	return resolve(event);
};

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
