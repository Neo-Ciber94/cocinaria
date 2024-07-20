import { Discord, GitHub, Google } from 'arctic';
import { env } from '$env/dynamic/private';
import { getBaseUrl } from '$lib/common/getBaseUrl';

const baseUrl = getBaseUrl();

export const googleAuth = new Google(
	env.GOOGLE_CLIENT_ID!,
	env.GOOGLE_CLIENT_SECRET!,
	`${baseUrl}/api/auth/google/callback`
);

export const githubAuth = new GitHub(env.GITHUB_CLIENT_ID!, env.GITHUB_CLIENT_SECRET!);

export const discordAuth = new Discord(
	env.DISCORD_CLIENT_ID!,
	env.DISCORD_CLIENT_SECRET!,
	`${baseUrl}/api/auth/discord/callback`
);
