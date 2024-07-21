import { toast as svelteToast } from 'svelte-sonner';
import { delay } from '$lib/index';
import type { GeneratedRecipeType } from '$lib/server/ai/recipe';

export async function reportRecipeGenerationStates(
	reader: ReadableStreamDefaultReader<Uint8Array>
) {
	function getId() {
		return crypto.randomUUID();
	}

	let generatedRecipe: GeneratedRecipeType | undefined;
	let toastId: number | string | undefined;
	const stateToastDuration = 30_000; // 30 seconds

	for await (const step of getRecipeGenerationStates(reader)) {
		switch (step.state) {
			case 'generating-recipe': {
				toastId = svelteToast.loading('Generating recipe...', {
					id: getId(),
					position: 'top-center',
					duration: stateToastDuration
				});
				break;
			}
			case 'recipe-done': {
				if (toastId) {
					svelteToast.dismiss(toastId);
				}

				toastId = svelteToast.success('Recipe was generated...', {
					id: getId(),
					position: 'top-center',
					duration: stateToastDuration
				});
				break;
			}
			case 'generating-image': {
				if (toastId) {
					svelteToast.dismiss(toastId);
				}

				toastId = svelteToast.loading('Generating recipe image...', {
					id: getId(),
					position: 'top-center',
					duration: stateToastDuration
				});
				break;
			}
			case 'done': {
				if (toastId) {
					svelteToast.dismiss(toastId);
				}

				svelteToast.success('Completed successfully!', {
					position: 'top-center'
				});

				generatedRecipe = step.contents;
				break;
			}
		}
	}

	return generatedRecipe;
}

type RecipeGenerationStates =
	| { state: 'generating-recipe' }
	| { state: 'recipe-done' }
	| { state: 'generating-image' }
	| { state: 'done'; contents: GeneratedRecipeType };

export async function* getRecipeGenerationStates(
	reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<RecipeGenerationStates> {
	const decoder = new TextDecoder();
	let contents: string = '';
	let recipeGenerated = false;

	yield { state: 'generating-recipe' };

	while (true) {
		const { done, value } = await reader.read();

		if (value) {
			contents += decoder.decode(value);
		}

		if (done) {
			break;
		}

		if (!recipeGenerated && isJson(contents)) {
			recipeGenerated = true;
			yield { state: 'recipe-done' };

			await delay(1000);

			yield { state: 'generating-image' };
		}
	}

	yield { state: 'done', contents: JSON.parse(contents) as GeneratedRecipeType };
}

// We try to guest if is a JSON, instead of just calling JSON.parse, we try to check for the end of the JSON: '}'
function isJson(s: string) {
	s = s.replace(/\s/g, '');

	if (/\}$/.test(s)) {
		try {
			JSON.parse(s);
			return true;
		} catch {
			return false;
		}
	}

	return false;
}
