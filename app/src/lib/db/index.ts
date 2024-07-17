import * as schema from './schema';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

if (!process.env.DATABASE_URL) {
	throw new Error('"DATABASE_URL" environment variable is not set');
}

export const client = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(client, { schema });
