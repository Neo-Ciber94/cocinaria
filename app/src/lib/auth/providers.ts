import { Discord, GitHub, Google } from 'arctic';
import { env } from '$env/dynamic/private';
import { getBaseUrl } from '$lib/common/getBaseUrl';

const baseUrl = getBaseUrl();

export function createGoogleAuth() {
	if (!env.GOOGLE_CLIENT_ID) {
		throw new Error('Missing GOOGLE_CLIENT_ID');
	}

	if (!env.GOOGLE_CLIENT_SECRET) {
		throw new Error('Missing GOOGLE_CLIENT_SECRET');
	}

	return new Google(
		env.GOOGLE_CLIENT_ID,
		env.GOOGLE_CLIENT_SECRET,
		`${baseUrl}/api/auth/google/callback`
	);
}

export function createGithubAuth() {
	if (!env.GITHUB_CLIENT_ID) {
		throw new Error('Missing GITHUB_CLIENT_ID');
	}

	if (!env.GITHUB_CLIENT_SECRET) {
		throw new Error('Missing GITHUB_CLIENT_SECRET');
	}

	return new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET);
}

export function createDiscordAuth() {
	if (!env.DISCORD_CLIENT_ID) {
		throw new Error('Missing DISCORD_CLIENT_ID');
	}

	if (!env.DISCORD_CLIENT_SECRET) {
		throw new Error('Missing DISCORD_CLIENT_SECRET');
	}

	return new Discord(
		env.DISCORD_CLIENT_ID!,
		env.DISCORD_CLIENT_SECRET!,
		`${baseUrl}/api/auth/discord/callback`
	);
}
