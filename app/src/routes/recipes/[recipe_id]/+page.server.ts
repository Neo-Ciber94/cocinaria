import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteRecipe, getRecipeById } from '$lib/server/recipes';
import { checkAuthenticated } from '$lib/server/utils';
import { getBaseUrl } from '$lib/common/getBaseUrl';
import { defaultImageLoader } from 'svelte-picture/imageLoader';

export const actions = {
	async deleteRecipe(event) {
		const { user } = checkAuthenticated(event);
		const deleted = await deleteRecipe(event.params.recipe_id, user.id);
		return { deleted };
	}
} satisfies Actions;

export const load: PageServerLoad = async (event) => {
	const recipe = await getRecipeById(event.params.recipe_id);

	if (!recipe) {
		error(404, { message: 'Recipe not found' });
	}

	const recipeImage = getImageUrl(recipe.imageUrl);
	const recipeUrl = `${getBaseUrl()}/recipes/${recipe.id}`;

	return {
		recipe,
		seo: {
			recipeUrl,
			imageUrl: recipeImage?.url,
			imageSize: recipeImage?.size
		}
	};
};

function getImageUrl(recipeImageUrl: string | null) {
	if (!recipeImageUrl) {
		return undefined;
	}

	const size = 1024;
	const relativeUrl = defaultImageLoader({
		url: recipeImageUrl,
		format: 'png',
		width: 1024,
		quality: 80
	});

	const url = `${getBaseUrl()}${relativeUrl}`;
	return { url, size };
}
