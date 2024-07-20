import { githubAuth } from '$lib/auth/providers';
import { lucia } from '$lib/auth/lucia';
import { db } from '$lib/db';
import { accounts } from '$lib/db/schema';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { generateState } from 'arctic';
import { and, eq } from 'drizzle-orm';
import { AuthError, redirectToAuthError } from '../../utils';
import { createUserAccount } from '$lib/server/users';

const COOKIE_GITHUB_OAUTH_STATE = 'github-oauth-state';

export const GET: RequestHandler = (event: RequestEvent) => {
	switch (event.url.pathname) {
		case '/api/auth/github/login':
			return handleLogin(event);
		case '/api/auth/github/callback':
			return handleCallback(event);
		default:
			return new Response(null, { status: 404 });
	}
};

async function handleLogin(event: RequestEvent) {
	const sessionCookie = event.cookies.get(lucia.sessionCookieName);

	if (sessionCookie) {
		try {
			const userSession = await lucia.validateSession(sessionCookie);
			if (userSession.user && userSession.session) {
				return new Response(null, {
					status: 302,
					headers: {
						Location: '/'
					}
				});
			}
		} catch (err) {
			console.error(err);
		}
	}

	try {
		const state = generateState();
		const url = await githubAuth.createAuthorizationURL(state);

		event.cookies.set(COOKIE_GITHUB_OAUTH_STATE, state, {
			path: '/',
			secure: process.env.NODE_ENV === 'production',
			httpOnly: true,
			maxAge: 60 * 5, // 5min
			sameSite: 'lax'
		});

		return new Response(null, {
			status: 302,
			headers: {
				Location: url.toString()
			}
		});
	} catch (err) {
		console.error(err);
		redirectToAuthError(AuthError.LoginError);
	}
}

async function handleCallback(event: RequestEvent) {
	const oauthState = event.cookies.get(COOKIE_GITHUB_OAUTH_STATE);
	const storedCode = event.url.searchParams.get('code');
	const storedState = event.url.searchParams.get('state');

	event.cookies.delete(COOKIE_GITHUB_OAUTH_STATE, { path: '/' });

	if (!oauthState || !storedState || !storedCode || storedState !== oauthState) {
		event.cookies.delete(lucia.sessionCookieName, { path: '/' });
		redirectToAuthError(AuthError.InvalidState);
	}

	try {
		const tokens = await githubAuth.validateAuthorizationCode(storedCode);

		// Retrieve user information
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const githubUser: GithubUser = await githubUserResponse.json();
		const existingAccount = await db.query.accounts.findFirst({
			where: and(
				eq(accounts.authAccountId, githubUser.id.toString()),
				eq(accounts.authProvider, 'github')
			)
		});

		const userId = existingAccount?.userId ?? crypto.randomUUID();

		if (existingAccount) {
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			return new Response(null, {
				status: 302,
				headers: {
					'Set-Cookie': sessionCookie.serialize(),
					Location: '/generate'
				}
			});
		}

		const accountId = crypto.randomUUID();
		await createUserAccount({
			userId,
			accountId,
			username: githubUser.name,
			picture: githubUser.avatar_url,
			authAccountId: githubUser.id.toString(),
			authProvider: 'github'
		});

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		return new Response(null, {
			status: 302,
			headers: {
				'Set-Cookie': sessionCookie.serialize(),
				Location: '/generate'
			}
		});
	} catch (err) {
		console.error(err);
		redirectToAuthError(AuthError.CallbackError);
	}
}

/** @see [Get the authenticated user](https://docs.github.com/en/rest/users/users#get-the-authenticated-user) */
interface GithubUser {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string | null;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
	name: string;
	company: string | null;
	blog: string | null;
	location: string | null;
	email: string | null;
	hireable: boolean | null;
	bio: string | null;
	twitter_username?: string | null;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: string;
	updated_at: string;
	private_gists?: number;
	total_private_repos?: number;
	owned_private_repos?: number;
	disk_usage?: number;
	suspended_at?: string | null;
	collaborators?: number;
	two_factor_authentication: boolean;
	plan?: {
		collaborators: number;
		name: string;
		space: number;
		private_repos: number;
	};
	[claim: string]: unknown;
}
