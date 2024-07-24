import { env } from '$env/dynamic/private';
import { createImageOptimizerHandler } from 'svelte-picture/server';

const handler = createImageOptimizerHandler({
	allowedOrigins: env.ASSETS_URL ? [] : [env.ASSETS_URL]
});

export { handler as GET, handler as HEAD };
