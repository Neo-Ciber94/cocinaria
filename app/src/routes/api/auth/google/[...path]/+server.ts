import { googleAuth, lucia } from '$lib/auth/lucia';
import { db } from '$lib/db';
import { accounts, users } from '$lib/db/schema';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { generateCodeVerifier, generateState } from 'arctic';
import { and, eq } from 'drizzle-orm';
import { AuthError, redirectToAuthError } from '../../utils';

const COOKIE_GOOGLE_OAUTH_STATE = 'google-oauth-state';
const COOKIE_GOOGLE_CODE_VERIFIER = 'google-oauth-verifier';

export const GET: RequestHandler = (event: RequestEvent) => {
	switch (event.url.pathname) {
		case '/api/auth/google/login':
			return handleLogin(event);
		case '/api/auth/google/callback':
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
		const codeVerifier = generateCodeVerifier();
		const url = await googleAuth.createAuthorizationURL(state, codeVerifier, {
			scopes: ['profile']
		});

		event.cookies.set(COOKIE_GOOGLE_OAUTH_STATE, state, {
			path: '/',
			secure: process.env.NODE_ENV === 'production',
			httpOnly: true,
			maxAge: 60 * 5, // 5min
			sameSite: 'lax'
		});

		event.cookies.set(COOKIE_GOOGLE_CODE_VERIFIER, codeVerifier, {
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
	const oauthState = event.cookies.get(COOKIE_GOOGLE_OAUTH_STATE);
	const oauthVerifier = event.cookies.get(COOKIE_GOOGLE_CODE_VERIFIER);
	const storedCode = event.url.searchParams.get('code');
	const storedState = event.url.searchParams.get('state');

	event.cookies.delete(COOKIE_GOOGLE_OAUTH_STATE, { path: '/' });
	event.cookies.delete(COOKIE_GOOGLE_CODE_VERIFIER, { path: '/' });

	if (!oauthVerifier || !oauthState || !storedState || !storedCode || storedState !== oauthState) {
		event.cookies.delete(lucia.sessionCookieName, { path: '/' });
		redirectToAuthError(AuthError.InvalidState);
	}

	try {
		const tokens = await googleAuth.validateAuthorizationCode(storedCode, oauthVerifier);

		// Retrieve user information
		const googleUserResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const googleUser: GoogleUser = await googleUserResponse.json();
		const existingAccount = await db.query.accounts.findFirst({
			where: and(eq(accounts.authAccountId, googleUser.sub), eq(accounts.authProvider, 'google'))
		});

		const userId = existingAccount?.userId ?? crypto.randomUUID();

		if (existingAccount) {
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			return new Response(null, {
				status: 302,
				headers: {
					'Set-Cookie': sessionCookie.serialize(),
					Location: '/'
				}
			});
		}

		const accountId = crypto.randomUUID();

		await db.transaction(async (tx) => {
			await tx.insert(users).values({
				id: userId,
				accountId,
				username: googleUser.name,
				picture: googleUser.picture
			});

			await tx.insert(accounts).values({
				userId,
				authAccountId: googleUser.sub,
				authProvider: 'google'
			});
		});

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		return new Response(null, {
			status: 302,
			headers: {
				'Set-Cookie': sessionCookie.serialize(),
				Location: '/'
			}
		});
	} catch (err) {
		console.error(err);
		redirectToAuthError(AuthError.CallbackError);
	}
}

// https://google.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/google.ts
interface GoogleUser {
	aud: string;
	azp: string;
	email: string;
	email_verified: boolean;
	exp: number;
	family_name?: string;
	given_name: string;
	hd?: string;
	iat: number;
	iss: string;
	jti?: string;
	locale?: string;
	name: string;
	nbf?: number;
	picture: string;
	sub: string;
}
