import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { env } from '$env/dynamic/private';
import { streamObject } from 'ai';
import { db } from '$lib/db';
import { recipes } from '$lib/db/schema';
import { recipeTypeSchema } from '$lib/common/recipe';

const openai = createOpenAI({
	apiKey: env.OPENAI_API_KEY ?? ''
});

const recipeJsonSchema = z.object({
	name: z.string({ description: 'Name of the recipe' }).trim(),
	ingredients: z.array(z.string(), { description: 'Ingredients and the amount' }),
	steps: z.array(z.string(), { description: 'Steps to prepare the recipe' })
});

export const generateRecipeInputSchema = z.object({
	ingredients: z.array(z.string()).transform((s) => new Set(s)),
	recipeType: recipeTypeSchema
});

type GenerateRecipeInput = z.infer<typeof generateRecipeInputSchema>;

type GenerateRecipeArgs = GenerateRecipeInput & {
	userId: string;
	abortSignal?: AbortSignal;
};

export async function generateRecipe({
	userId,
	recipeType,
	ingredients,
	abortSignal
}: GenerateRecipeArgs) {
	const ingredientsList = Array.from(ingredients);
	const prompt = `Create a food recipe of a ${recipeType} 
    that include only the following ingredients and not any other: ${ingredientsList.join(',')}`;

	// We gonna stream the result in case the platform where the app is hosted timeout if the object generation takes too much time
	const stream = await streamObject({
		model: openai('gpt-4-turbo'),
		schema: recipeJsonSchema,
		mode: 'json',
		prompt,
		abortSignal,
		async onFinish({ object }) {
			if (!object) {
				// The object did not matched the schema, return error somehow?
				return;
			}

			await db.insert(recipes).values({
				name: object.name,
				ingredients: object.ingredients,
				steps: object.steps,
				prompt,
				userId
			});
		}
	});

	return stream;
}
