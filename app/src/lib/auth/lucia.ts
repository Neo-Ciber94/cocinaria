import { db } from '$lib/db';
import { sessions, users } from '$lib/db/schema';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Discord, GitHub, Google } from 'arctic';
import { Lucia, TimeSpan } from 'lucia';
import { env } from '$env/dynamic/private';

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

export const googleAuth = new Google(
	env.GOOGLE_CLIENT_ID!,
	env.GOOGLE_CLIENT_SECRET!,
	env.GOOGLE_REDIRECT_URL!
);

export const githubAuth = new GitHub(env.GITHUB_CLIENT_ID!, env.GITHUB_CLIENT_SECRET!);

export const discordAuth = new Discord(
	env.DISCORD_CLIENT_ID!,
	env.DISCORD_CLIENT_SECRET!,
	env.DISCORD_REDIRECT_URL!
);
