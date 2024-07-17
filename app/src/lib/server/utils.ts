import { error, type RequestEvent } from '@sveltejs/kit';

export function checkAuthenticated(event: RequestEvent) {
	if (event.locals.auth == null) {
		error(401, { message: 'Not authenticated' });
	}
}
