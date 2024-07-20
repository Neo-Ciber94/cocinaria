import type { getRecipes } from '$lib/server/recipes';

export type GetRecipesResult = Awaited<ReturnType<typeof getRecipes>>;
