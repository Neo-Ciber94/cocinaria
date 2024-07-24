import { sequence } from '@sveltejs/kit/hooks';
import { authentication } from '$lib/middlewares/authentication';
import { optimizeImage } from 'svelte-picture/server';
import { env } from '$env/dynamic/private';

export const handle = sequence(
	optimizeImage({
		allowedOrigins: [env.ASSETS_URL]
	}),
	authentication()
);
