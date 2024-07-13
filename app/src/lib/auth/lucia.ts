import { db } from '$lib/db';
import { sessions, users } from '$lib/db/schema';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia, TimeSpan } from 'lucia';

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === 'production'
		}
	},
	sessionExpiresIn: new TimeSpan(7, 'd'),
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			picture: attributes.picture,
			createdAt: attributes.createdAt
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			username: string;
			picture?: string;
			createdAt: Date;
		};
	}
}
