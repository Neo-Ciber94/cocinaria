import * as schema from './schema';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

export const { db, client } = await createDatabase();

// Databases and vercel edge runtime do not play well, so we need to use a serverless database
// for those scenarios, or just host this app in a serverfull environment, like a VPS instead.
async function createDatabase() {
	if (!process.env.DATABASE_URL) {
		throw new Error('"DATABASE_URL" environment variable is not set');
	}

	const USE_SERVERLESS = Boolean(env.USE_SERVERLESS_DB);

	if (dev && !USE_SERVERLESS) {
		const { drizzle } = await import('drizzle-orm/postgres-js');
		const { default: postgres } = await import('postgres');

		const client = postgres(process.env.DATABASE_URL);
		const db = drizzle(client, { schema });
		return { client, db };
	} else {
		const { neon } = await import('@neondatabase/serverless');
		const { drizzle } = await import('drizzle-orm/neon-http');

		const client = neon(process.env.DATABASE_URL);
		const db = drizzle(client, { schema });
		return { client, db };
	}
}
