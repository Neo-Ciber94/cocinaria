import { optimizeImage } from '$lib/server/index.js';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
	optimizeImage({
		allowedOrigins: ['https://image.civitai.com']
	})
);
