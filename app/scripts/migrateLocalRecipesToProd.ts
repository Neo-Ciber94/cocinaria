import dotenv from 'dotenv';
dotenv.config({
	path: ['.env', '.env.migrate'],
	override: true
});

import * as schema from '../src/lib/db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { recipes } from '../src/lib/db/schema';
import nodeCrypto from 'node:crypto';

async function main() {
	const neonLocal = createPgClient(process.env.DATABASE_LOCAL_URL!);
	const neonRemote = createPgClient(process.env.DATABASE_REMOTE_URL!);

	const remoteRecipes = await neonRemote.db.query.recipes.findMany({
		where(fields, { eq }) {
			return eq(fields.userId, String(process.env.MIGRATE_TO_USER_ID));
		}
	});

	await neonLocal.db.transaction(async (tx) => {
		const localRecipes = await tx.query.recipes.findMany();
		console.log(`🕒 Migrating ${localRecipes.length} recipes to remote database...`);

		for (const recipe of localRecipes) {
			const recipeHash = createRecipeHash(recipe);
			const alreadyAdded = remoteRecipes.some((x) => createRecipeHash(x) === recipeHash);

			if (alreadyAdded) {
				console.log(`⚠️  Recipe ${recipe.id} already exists, skipping...`);
				continue;
			}

			console.log(`Migrating recipe(${recipe.id}): ${recipe.name}`);
		}
	});

	await Promise.allSettled([neonRemote.client.end(), neonLocal.client.end()]);
}

function createPgClient(databaseUrl: string) {
	const client = postgres(databaseUrl);
	const db = drizzle(client, { schema });
	return { client, db };
}

function createRecipeHash(recipe: typeof recipes.$inferSelect): string {
	const hash = nodeCrypto.createHash('sha1');
	hash.update(recipe.name);
	hash.update(recipe.recipeType);
	hash.update(recipe.prompt);
	hash.update(recipe.ingredients.join(','));

	if (recipe.description) {
		hash.update(recipe.description);
	}

	if (recipe.imageUrl) {
		hash.update(recipe.imageUrl);
	}

	return hash.digest().toString('base64');
}

main().catch(console.error);
