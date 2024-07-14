import { getAuth } from '$lib/auth/utils';
import { generateRecipe, generateRecipeInputSchema } from '$lib/server/ai';
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

		return generateRecipeStream.toTextStreamResponse();
	} catch (err) {
		console.error(err);
		return new Response(null, { status: 500 });
	}
};
