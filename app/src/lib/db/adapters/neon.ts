import * as schema from '../schema';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

if (!process.env.DATABASE_URL) {
	throw new Error('"DATABASE_URL" environment variable is not set');
}

neonConfig.webSocketConstructor = ws;

if (!process.env.VERCEL_ENV) {
	// Set the WebSocket proxy to work with the local instance
	neonConfig.wsProxy = (host) => `${host}:23456/v1`;
	// Disable all authentication and encryption
	neonConfig.useSecureWebSocket = false;
	neonConfig.pipelineTLS = false;
	neonConfig.pipelineConnect = false;
}

export const client = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(client, { schema, logger: true });
