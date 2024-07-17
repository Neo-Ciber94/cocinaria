import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const auth = event.locals.auth;

	if (auth == null) {
		redirect(307, '/login');
	}

	const user = auth.user;
	const account = auth.account;
	return { user, account };
};
