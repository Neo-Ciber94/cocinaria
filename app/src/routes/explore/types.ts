import type { getRecipes } from "$lib/server/recipes";

export type RecipeList = Awaited<ReturnType<typeof getRecipes>>;
