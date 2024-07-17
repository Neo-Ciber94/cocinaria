import { ApplicationError } from '$lib/common/error';
import { generateRecipe, generateRecipeInputSchema } from '$lib/server/ai/recipe';
import { checkAuthenticated, getAIProviderConfig } from '$lib/server/utils';
import { error, type RequestHandler } from '@sveltejs/kit';
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
	runtime: 'edge'
};

export const POST: RequestHandler = async (event) => {
	const { session } = checkAuthenticated(event);

	try {
		const body = await event.request.json();
		const result = generateRecipeInputSchema.safeParse(body);

		if (!result.success) {
			console.error(
				'Failed to generate recipe, input was invalid',
				result.error.issues.map((e) => `${e.path}: ${e.message}`)
			);
			error(400, { message: 'Invalid generate recipe input' });
		}

		const { ingredients, recipeType } = result.data;
		const aiConfig = getAIProviderConfig(event.cookies);

		const generateRecipeStream = await generateRecipe({
			userId: session.userId,
			abortSignal: event.request.signal,
			ingredients,
			recipeType,
			aiConfig
		});

		const stream = generateRecipeStream.textStream;
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			}
		});
	} catch (err) {
		console.error(err);

		if (err instanceof ApplicationError) {
			error(400, { message: err.message });
		}

		return new Response(null, { status: 500 });
	}
};
