import * as schema from '../schema';
import { createPool } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';

export const client = createPool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(client, { schema });
