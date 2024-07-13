import { sequence } from '@sveltejs/kit/hooks';
import { authentication } from '$lib/middlewares/authentication';

export const handle = sequence(authentication());
