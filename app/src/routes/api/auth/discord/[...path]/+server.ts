import { discordAuth, lucia } from '$lib/auth/lucia';
import { db } from '$lib/db';
import { accounts, users } from '$lib/db/schema';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { generateState } from 'arctic';
import { and, eq } from 'drizzle-orm';
import { AuthError, redirectToAuthError } from '../../utils';

const COOKIE_DISCORD_OAUTH_STATE = 'discord-oauth-state';

export const GET: RequestHandler = (event: RequestEvent) => {
	switch (event.url.pathname) {
		case '/api/auth/discord/login':
			return handleLogin(event);
		case '/api/auth/discord/callback':
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

	const state = generateState();
	const url = await discordAuth.createAuthorizationURL(state, {
		scopes: ['identify']
	});

	event.cookies.set(COOKIE_DISCORD_OAUTH_STATE, state, {
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
}

async function handleCallback(event: RequestEvent) {
	const oauthState = event.cookies.get(COOKIE_DISCORD_OAUTH_STATE);
	const storedCode = event.url.searchParams.get('code');
	const storedState = event.url.searchParams.get('state');

	event.cookies.delete(COOKIE_DISCORD_OAUTH_STATE, { path: '/' });

	if (!oauthState || !storedState || !storedCode || storedState !== oauthState) {
		event.cookies.delete(lucia.sessionCookieName, { path: '/' });
		redirectToAuthError(AuthError.InvalidState);
	}

	try {
		const tokens = await discordAuth.validateAuthorizationCode(storedCode);

		// Retrieve user information
		const discordAuthResponse = await fetch('https://discord.com/api/users/@me', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const discordUser: DiscordUser = await discordAuthResponse.json();
		const existingAccount = await db.query.accounts.findFirst({
			where: and(eq(accounts.authAccountId, discordUser.id), eq(accounts.authProvider, 'discord'))
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
				username: discordUser.username,
				picture: getUserAvatar(discordUser)
			});

			await tx.insert(accounts).values({
				userId,
				authAccountId: discordUser.id.toString(),
				authProvider: 'discord'
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

// https://discord.com/developers/docs/reference#image-formatting
function getUserAvatar(user: DiscordUser) {
	return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
}

/**
 * Corresponds to the user structure documented here:
 * https://discord.com/developers/docs/resources/user#user-object-user-structure
 */
interface DiscordUser extends Record<string, unknown> {
	/** the user's id (i.e. the numerical snowflake) */
	id: string;
	/** the user's username, not unique across the platform */
	username: string;
	/** the user's Discord-tag */
	discriminator: string;
	/** the user's display name, if it is set  */
	global_name: string | null;
	/**
	 * the user's avatar hash:
	 * https://discord.com/developers/docs/reference#image-formatting
	 */
	avatar: string | null;
	/** whether the user belongs to an OAuth2 application */
	bot?: boolean;
	/**
	 * whether the user is an Official Discord System user (part of the urgent
	 * message system)
	 */
	system?: boolean;
	/** whether the user has two factor enabled on their account */
	mfa_enabled: boolean;
	/**
	 * the user's banner hash:
	 * https://discord.com/developers/docs/reference#image-formatting
	 */
	banner: string | null;

	/** the user's banner color encoded as an integer representation of hexadecimal color code */
	accent_color: number | null;

	/**
	 * the user's chosen language option:
	 * https://discord.com/developers/docs/reference#locales
	 */
	locale: string;
	/** whether the email on this account has been verified */
	verified: boolean;
	/** the user's email */
	email: string | null;
	/**
	 * the flags on a user's account:
	 * https://discord.com/developers/docs/resources/user#user-object-user-flags
	 */
	flags: number;
	/**
	 * the type of Nitro subscription on a user's account:
	 * https://discord.com/developers/docs/resources/user#user-object-premium-types
	 */
	premium_type: number;
	/**
	 * the public flags on a user's account:
	 * https://discord.com/developers/docs/resources/user#user-object-user-flags
	 */
	public_flags: number;
	/** undocumented field; corresponds to the user's custom nickname */
	display_name: string | null;
	/**
	 * undocumented field; corresponds to the Discord feature where you can e.g.
	 * put your avatar inside of an ice cube
	 */
	avatar_decoration: string | null;
	/**
	 * undocumented field; corresponds to the premium feature where you can
	 * select a custom banner color
	 */
	banner_color: string | null;
}
