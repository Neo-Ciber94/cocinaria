import { db } from '$lib/db';
import { sessions, users } from '$lib/db/schema';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { GitHub, Google } from 'arctic';
import { Lucia, TimeSpan } from 'lucia';
import {
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REDIRECT_URL
} from '$env/static/private';

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
			email: attributes.email,
			username: attributes.username,
			picture: attributes.picture
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			username: string;
			email: string;
			picture?: string;
		};
	}
}

export const googleAuth = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL);

export const githubAuth = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);
