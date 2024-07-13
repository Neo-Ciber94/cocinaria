import { getAuth } from '$lib/auth/utils';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const auth = await getAuth(event.cookies);
	event.locals.auth = auth;
	return resolve(event);
};
