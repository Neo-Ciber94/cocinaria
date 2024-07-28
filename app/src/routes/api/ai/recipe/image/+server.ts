import { ApplicationError } from '$lib/common/error';
import { generateRecipeImage } from '$lib/server/ai/recipe';
import { rateLimiter } from '$lib/server/ratelimiter';
import { checkAuthenticated, getAIProviderConfig } from '$lib/server/utils';
import type { Config } from '@sveltejs/adapter-vercel';
import { error, type RequestHandler } from '@sveltejs/kit';
import { task, TaskError } from 'svelte-stream/task';

export const config: Config = {
	runtime: 'edge'
};

export type GeneratedImage = { url: string | null };

export const POST: RequestHandler = async (event) => {
	const auth = checkAuthenticated(event);
	const { success } = await rateLimiter.limit(event, auth.user.id);

	if (!success) {
		error(429, { message: 'Too many requests' });
	}

	const session = auth.session;
	const aiConfig = getAIProviderConfig(event.cookies);
	const recipeId = event.url.searchParams.get('recipe_id');

	return task<GeneratedImage>(async () => {
		if (!recipeId) {
			throw new TaskError('Missing recipe_id in request search params');
		}

		try {
			const imageResult = await generateRecipeImage({
				userId: session.userId,
				aiConfig,
				input: {
					action: 'find-and-update',
					recipeId
				}
			});

			if (!imageResult) {
				throw new TaskError('Failed to find the recipe');
			}

			return { url: imageResult.imageUrl };
		} catch (err) {
			console.error(err);

			if (err instanceof ApplicationError) {
				throw new TaskError(err.message);
			}

			throw err;
		}
	});
};
