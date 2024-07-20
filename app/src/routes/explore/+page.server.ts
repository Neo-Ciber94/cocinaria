import type { PageServerLoad } from './$types';

// This ensure the middleware runs
export const load: PageServerLoad = async () => {
	return {};
};
