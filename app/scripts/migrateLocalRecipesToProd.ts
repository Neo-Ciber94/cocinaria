import dotenv from 'dotenv';
dotenv.config({
	path: ['.env', '.env.migrate'],
	override: true
});

import * as schema from '../src/lib/db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { recipes } from '../src/lib/db/schema';
import nodeCrypto from 'node:crypto';
import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';
import path from 'node:path';
import { generateBase64Id } from '$lib/server/utils';

const s3Client = new S3Client({
	endpoint: process.env.S3_API_ENDPOINT,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY!,
		secretAccessKey: process.env.S3_ACCESS_SECRET_KEY!
	}
});

async function main() {
	const neonLocal = createPgClient(process.env.DATABASE_LOCAL_URL!);
	const neonRemote = createPgClient(process.env.DATABASE_REMOTE_URL!);

	const targetUser = await neonRemote.db.query.users.findFirst({
		where(fields, { eq }) {
			return eq(fields.id, String(process.env.MIGRATE_TO_USER_ID));
		}
	});

	if (!targetUser) {
		throw new Error('User not found');
	}

	console.log(`Migrating recipe images to user: ${targetUser.id}, User(${targetUser.username})`);

	const localRecipes = await neonLocal.db.query.recipes.findMany();
	console.log(`🕒 Migrating ${localRecipes.length} recipes to remote database...`);

	await neonRemote.db.transaction(async (tx) => {
		const remoteRecipes = await tx.query.recipes.findMany({
			where(fields, { eq }) {
				return eq(fields.userId, String(process.env.MIGRATE_TO_USER_ID));
			}
		});

		for (const recipe of localRecipes) {
			const recipeHash = createRecipeHash(recipe);
			const alreadyAdded = remoteRecipes.some((x) => createRecipeHash(x) === recipeHash);

			if (alreadyAdded) {
				console.log(`⚠️  Recipe ${recipe.id} already exists, skipping...`);
				continue;
			}

			if (recipe.imageUrl == null) {
				continue;
			}

			console.log(`Migrating recipe(${recipe.id}): ${recipe.name}`);

			const { newImageUrl } = await copyRecipeImage(recipe.imageUrl);

			// Insert new recipe
			await tx.insert(recipes).values({
				name: recipe.name,
				description: recipe.description,
				ingredients: recipe.ingredients,
				prompt: recipe.prompt,
				recipe: recipe.recipe,
				recipeType: recipe.recipeType,

				// New user Id
				userId: targetUser.id,

				// New image url
				imageUrl: newImageUrl
			});
		}
	});

	await Promise.allSettled([neonRemote.client.end(), neonLocal.client.end()]);
}

async function copyRecipeImage(imageUrl: string) {
	const key = imageUrl.replaceAll(process.env.ASSETS_URL!, '');
	const fileId = generateBase64Id();

	const ext = path.extname(imageUrl);
	const newKey = `images/${fileId}${ext}`;
	const newImageUrl = `${process.env.ASSETS_URL}/${key}`;

	// Copy file
	console.log(`📂 Copying file '${key}' to ${newKey}, new url: ${newImageUrl}`);

	const bucketName = process.env.S3_BUCKET_NAME;
	await s3Client.send(
		new CopyObjectCommand({
			Bucket: bucketName,
			CopySource: key,
			Key: newKey,
			MetadataDirective: 'COPY',
			Metadata: {
				migrate: 'true'
			}
		})
	);

	return {
		newImageUrl
	};
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
