import { getSession } from '$lib/auth/utils';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const session = await getSession(event.cookies);
	event.locals.session = session;
	return resolve(event);
};
