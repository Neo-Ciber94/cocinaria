import { db } from '$lib/db';
import { recipes } from '$lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function getRecipeById(recipeId: string) {
	const recipe = await db.query.recipes.findFirst({
		columns: {
			prompt: false,
			recipeType: false
		},
		where(fields, { eq }) {
			return eq(fields.id, recipeId);
		}
	});

	return recipe;
}

export async function getUserRecipes(userId: string) {
	const recipes = await db.query.recipes.findMany({
		columns: {
			id: true,
			userId: true,
			name: true,
			imageUrl: true,
			createdAt: true,
			ingredients: true
		},
		where(fields, { and, eq }) {
			return and(eq(fields.userId, userId));
		},
		orderBy(fields, { desc }) {
			return desc(fields.createdAt);
		}
	});

	return recipes;
}

export async function deleteRecipe(recipeId: string, userId: string) {
	const result = await db
		.delete(recipes)
		.where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)));

	return result.count > 0;
}
