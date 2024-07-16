import { getAuth } from '$lib/auth/utils';
import { ApplicationError } from '$lib/common/error';
import { generateRecipe, generateRecipeInputSchema } from '$lib/server/ai/recipe';
import { error, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async (event) => {
	const session = await getAuth(event.cookies);

	if (!session) {
		error(401, { message: 'Unauthorized' });
	}

	try {
		const body = await event.request.json();
		const result = generateRecipeInputSchema.safeParse(body);

		if (!result.success) {
			console.log(
				'Failed to generate recipe, input was invalid',
				result.error.issues.map((e) => `${e.path}: ${e.message}`)
			);
			error(400, { message: 'Invalid generate recipe input' });
		}

		const { ingredients, recipeType } = result.data;

		const generateRecipeStream = await generateRecipe({
			userId: session.user.id,
			abortSignal: event.request.signal,
			ingredients,
			recipeType
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
