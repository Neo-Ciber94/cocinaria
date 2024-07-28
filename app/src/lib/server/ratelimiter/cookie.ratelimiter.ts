import type { RequestEvent } from '@sveltejs/kit';
import { RateLimiter, type RateLimiterResult } from './base';
import { invariant } from '$lib/index';
import { z } from 'zod';
import { decodeJwt, encodeJwt } from '../jwt';
import { dev } from '$app/environment';

const encoder = new TextEncoder();
const COOKIE_RATE_LIMITER_KEY = 'cocinaria:rate-limit';

const rateLimitEntrySchema = z.object({
	remaining: z.coerce.number(),
	expires: z.coerce.date()
});

type RateLimitEntry = z.infer<typeof rateLimitEntrySchema>;

type CookieBasedRateLimiterOptions = {
	max: number;
	windowMs: number;
};

/**
 * A rate-limiter that store the information in a cookie.
 *
 * This is a straightforward implementation of a rate limiter but not reliable
 * because the state is stored on the client.
 */
export class CookieBasedRateLimiter extends RateLimiter {
	#max: number;
	#windowMs: number;

	constructor(options: CookieBasedRateLimiterOptions) {
		super();

		invariant(options.max > 0, 'Rate limiter max count should be positive');
		invariant(options.windowMs > 0, 'Rate limiter window should be positive');

		this.#max = options.max;
		this.#windowMs = options.windowMs;
	}

	async limit(event: RequestEvent, key: string): Promise<RateLimiterResult> {
		const hashedKey = await this.#hashKey(key);
		const cookieName = `${COOKIE_RATE_LIMITER_KEY}:${hashedKey}`;
		const cookieValue = event.cookies.get(cookieName);
		const now = new Date();

		const entry: RateLimitEntry | null = decodeRateLimitCookie(cookieValue || '');

		if (!entry) {
			const expires = new Date(now.getTime() + this.#windowMs);
			await this.#setRateLimiterCookie(event, cookieName, {
				remaining: this.#max,
				expires
			});

			return { success: true, remaining: this.#max };
		}

		if (now > entry.expires) {
			entry.remaining = this.#max;
		} else {
			entry.remaining -= 1;
		}

		if (entry.remaining < 0) {
			entry.remaining = 0;
			await this.#setRateLimiterCookie(event, cookieName, entry);
			return { success: false, remaining: 0 };
		}

		await this.#setRateLimiterCookie(event, cookieName, entry);
		return { success: true, remaining: entry.remaining };
	}

	async #setRateLimiterCookie(event: RequestEvent, cookieName: string, entry: RateLimitEntry) {
		const token = await encodeRateLimitCookie(entry);
		event.cookies.set(cookieName, token, {
			path: '/',
			httpOnly: true,
			secure: !dev,
			expires: entry.expires
		});

		event.setHeaders({
			'X-RateLimit-Remaining': entry.remaining.toString(),
			'X-RateLimit-Reset': entry.expires.toISOString()
		});
	}

	async #hashKey(key: string) {
		const buffer = encoder.encode(key);
		const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
		return hashHex;
	}
}

async function encodeRateLimitCookie(input: RateLimitEntry) {
	const token = await encodeJwt(input, {
		expiration: input.expires
	});

	return token;
}

function decodeRateLimitCookie(token: string) {
	if (!token) {
		return null;
	}

	const json = decodeJwt(token);

	if (!json) {
		return null;
	}

	const result = rateLimitEntrySchema.safeParse(json);
	return result.success ? result.data : null;
}
