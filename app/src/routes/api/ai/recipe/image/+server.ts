import { ApplicationError } from '$lib/common/error';
import { invariant } from '$lib/index';
import { generateRecipeImage } from '$lib/server/ai/recipe';
import { checkAuthenticated, getAIProviderConfig } from '$lib/server/utils';
import type { Config } from '@sveltejs/adapter-vercel';
import { error, type RequestHandler } from '@sveltejs/kit';

export const config: Config = {
	runtime: 'edge'
};

const encoder = new TextEncoder();

export const GET: RequestHandler = async (event) => {
	const { session } = checkAuthenticated(event);
	const aiConfig = getAIProviderConfig(event.cookies);
	const recipeId = event.url.searchParams.get('recipe_id');

	let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
	const stream = new ReadableStream<Uint8Array>({
		start(defaultController) {
			controller = defaultController;
		}
	});

	const response = new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});

	function write(data: unknown, event?: 'fail') {
		invariant(controller, 'Stream controller is not ready');

		const json = JSON.stringify(data);
		if (event) {
			controller.enqueue(encoder.encode(`event: ${event}\n`));
		}

		controller.enqueue(encoder.encode(`data: ${json}\n\n`));
		controller.close();
	}

	if (!recipeId) {
		write('Missing recipe_id in request search params', 'fail');
		return response;
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
			write('Failed to generate image', 'fail');
		} else {
			write({ url: imageResult?.imageUrl });
		}

		return response;
	} catch (err) {
		console.error(err);

		if (err instanceof ApplicationError) {
			write(err.message, 'fail');
			return response;
		}

		error(500, { message: 'Internal Error' });
	}
};

// export const POST: RequestHandler = async (event) => {
// 	const { session } = checkAuthenticated(event);
// 	const aiConfig = getAIProviderConfig(event.cookies);
// 	const recipeId = event.url.searchParams.get('recipe_id');

// 	if (!recipeId) {
// 		error(400, 'Missing recipe_id in request search params');
// 	}

// 	try {
// 		const imageResult = await generateRecipeImage({
// 			userId: session.userId,
// 			aiConfig,
// 			input: {
// 				action: 'find-and-update',
// 				recipeId
// 			}
// 		});

// 		if (!imageResult) {
// 			error(400, { message: 'Failed to generate image' });
// 		}

// 		return Response.json({ url: imageResult?.imageUrl });
// 	} catch (err) {
// 		console.error(err);

// 		if (err instanceof ApplicationError) {
// 			error(400, { message: err.message });
// 		}

// 		error(500, { message: 'Internal Error' });
// 	}
// };
