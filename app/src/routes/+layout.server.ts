import { db } from '$lib/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const user = await db.query.users.findFirst();
	return { user };
};
