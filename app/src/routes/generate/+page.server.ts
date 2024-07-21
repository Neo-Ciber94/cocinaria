import type { PageServerLoad } from './$types';

// This ensure the auth middleware is triggered
export const load: PageServerLoad = async () => {
	return {};
};
