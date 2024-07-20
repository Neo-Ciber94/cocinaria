import { db } from '$lib/db';
import { recipes } from '$lib/db/schema';
import { and, eq, SQL } from 'drizzle-orm';

type GetRecipesArgs = {
	search?: string;
	ingredients?: string[];
};

export async function getRecipes(args?: GetRecipesArgs) {
	const { search, ingredients } = args || {};
	const recipes = await db.query.recipes.findMany({
		columns: {
			id: true,
			userId: true,
			name: true,
			imageUrl: true,
			createdAt: true,
			ingredients: true
		},
		where(fields, { like, sql }) {
			const chunks: SQL[] = [];

			if (search) {
				chunks.push(like(fields.name, search));
			}

			if (ingredients && ingredients.length > 0) {
				const arr = JSON.stringify(ingredients);
				chunks.push(sql`${fields.ingredients} @> ${arr}`);
			}

			if (chunks.length === 0) {
				return undefined;
			}

			return sql.join(chunks, sql` and `);
		},
		orderBy(fields, { desc }) {
			return desc(fields.createdAt);
		}
	});

	return recipes;
}

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

	return result.rows.length > 0;
}
