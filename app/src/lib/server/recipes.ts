import { db } from '$lib/db';
import { recipes } from '$lib/db/schema';
import { and, eq, SQL } from 'drizzle-orm';

type GetRecipesArgs = {
	search?: string | null;
	ingredients?: string[];
	cursor?: string | null;
};

const LIMIT = 10;

export async function getRecipes(args?: GetRecipesArgs) {
	function encodeCursor(id: string, date: Date) {
		const json = JSON.stringify({ id, date });
		return btoa(json);
	}

	function decodeCursor(cursor: string | null | undefined) {
		if (!cursor) {
			return null;
		}

		try {
			const { id, ...rest } = JSON.parse(atob(cursor));
			const date = new Date(rest.date);

			if (Number.isNaN(date.getTime()) || typeof id !== 'string') {
				return null;
			}

			return { id, date };
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	// TODO: Make an index between recipes.createdAt, recipes.id

	const { search, ingredients, cursor } = args || {};

	const recipes = await db.query.recipes.findMany({
		limit: LIMIT + 1, // We fetch an extra element, this will be used as the cursor
		columns: {
			id: true,
			userId: true,
			name: true,
			imageUrl: true,
			createdAt: true,
			ingredients: true
		},
		where(fields, { and, or, eq, ilike, sql, lte }) {
			const decoded = decodeCursor(cursor);
			const chunks: SQL[] = [];

			if (decoded) {
				const { id, date } = decoded;
				// We return the element that is the cursor and the following elements
				chunks.push(or(eq(fields.id, id), and(lte(fields.createdAt, date), lte(fields.id, id)))!);
			}

			if (search) {
				chunks.push(ilike(fields.name, `%${search}%`));
			}

			if (ingredients && ingredients.length > 0) {
				chunks.push(sql`${fields.ingredients}::jsonb @> ${ingredients}`);
			}

			if (chunks.length === 0) {
				return undefined;
			}

			return sql.join(chunks, sql` and `);
		},
		orderBy(fields, { desc }) {
			return [desc(fields.createdAt), desc(fields.id)];
		}
	});

	let next: string | null = null;

	if (recipes.length > LIMIT) {
		const last = recipes.pop()!;
		next = encodeCursor(last.id, last.createdAt);
	}

	return {
		recipes,
		next
	};
}

export async function getRecipeById(recipeId: string) {
	const recipe = await db.query.recipes.findFirst({
		columns: {
			prompt: false,
			recipeType: false
		},
		where(fields, { eq }) {
			return eq(fields.id, recipeId);
		},
		with: {
			user: {
				columns: {
					username: true,
					picture: true
				}
			}
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
