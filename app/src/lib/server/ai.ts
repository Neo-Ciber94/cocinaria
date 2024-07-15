import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { env } from '$env/dynamic/private';
import { streamObject } from 'ai';
import { db } from '$lib/db';
import { recipes } from '$lib/db/schema';
import { recipeTypeSchema } from '$lib/common/recipe';
import OpenAI from 'openai';
import { uploadFile } from './upload';
import { and, eq } from 'drizzle-orm';

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

	async function addRecipeImage(recipeName: string, recipeId: string) {
		try {
			const prompt = `An image in a single color background of a ${recipeType} 
				containing only the following ingredients and not any other: ${ingredientsList.join(',')}
				of a dish named '${recipeName}',
				in a watercolor style`;

			const resultImage = await generateImage({
				userId,
				prompt
			});

			await db
				.update(recipes)
				.set({ imageUrl: resultImage.url })
				.where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)));
		} catch (err) {
			console.error(err);
		}
	}

	// We gonna stream the result in case the platform where the app is hosted timeout if the object generation takes too much time
	const stream = await streamObject({
		model: openai('gpt-4-turbo'),
		schema: recipeJsonSchema,
		mode: 'json',
		prompt,
		abortSignal,
		async onFinish({ object, error, warnings }) {
			if (error) {
				console.log(error);
			}

			if (warnings) {
				console.warn(warnings);
			}

			if (!object) {
				// The object did not matched the schema, return error somehow?
				console.error('Generated object dit not matches the schema');
				return;
			}

			try {
				const recipe = await db
					.insert(recipes)
					.values({
						userId,
						prompt,
						name: object.name,
						ingredients: ingredientsList,
						recipe: {
							ingredients: object.ingredients,
							steps: object.steps
						}
					})
					.returning()
					.then((ret) => ret[0]);

				// We do not generate the image in a transaction, both can fail independently
				await addRecipeImage(recipe.name, recipe.id).catch(() => null);
			} catch (err) {
				console.error('Failed to insert generated recipe into the database', err);
				throw err;
			}
		}
	});

	return stream;
}

type GenerateImageArgs = {
	prompt: string;
	userId: string;
};

export async function generateImage({ prompt, userId }: GenerateImageArgs) {
	const openAI = new OpenAI({ apiKey: env.OPENAI_API_KEY });

	const response = await openAI.images.generate({
		model: 'dall-e-3',
		response_format: 'url',
		user: userId,
		style: 'natural',
		prompt
	});

	const imageUrl = response.data[0]?.url;

	if (!imageUrl) {
		throw new Error('Not image was generated');
	}

	const imageResponse = await fetch(imageUrl);

	if (!imageResponse.ok) {
		throw new Error('Failed to fetch generated image');
	}

	const blob = await imageResponse.blob();
	const uploadedImage = await uploadFile({
		data: blob,
		metadata: {
			prompt,
			userId,
			aiGenerated: 'true',
			model: 'dall-e-3',
			date: new Date().toISOString()
		}
	});
	return uploadedImage;
}
