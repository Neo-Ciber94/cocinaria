import type { RequestEvent } from '@sveltejs/kit';
import { RateLimiter, type RateLimiterResult } from '.';
import { invariant } from '$lib/index';
import { z } from 'zod';
import { decodeJwt, encodeJwt } from '../jwt';

const COOKIE_RATE_LIMITER_KEY = 'cocinaria:rate-limit';

const rateLimitEntrySchema = z.object({
	count: z.number().positive(),
	expires: z.date()
});

type RateLimitEntry = z.infer<typeof rateLimitEntrySchema>;

type CookieBasedRateLimiterOptions = {
	count: number;
	windowMs: number;
};

export class CookieBasedRateLimiter extends RateLimiter {
	#count: number;
	#windowMs: number;

	constructor(options: CookieBasedRateLimiterOptions) {
		super();

		invariant(options.count > 0, 'Rate limiter count should be positive');
		invariant(options.windowMs > 0, 'Rate limiter window should be positive');

		this.#count = options.count;
		this.#windowMs = options.count;
	}

	async limit(event: RequestEvent, key: string): Promise<RateLimiterResult> {
		const cookieName = `${COOKIE_RATE_LIMITER_KEY}:${key}`;
		const cookieValue = event.cookies.get(cookieName);
		const now = new Date();

		const entry: RateLimitEntry | null = decodeRateLimitCookie(cookieValue || '');

		if (!entry) {
			const expires = new Date(now.getTime() + this.#windowMs);
			await this.#setRateLimiterCookie(event, cookieName, {
				count: this.#count,
				expires
			});

			return { success: true, remaining: this.#count };
		}

		if (entry.expires >= now) {
			entry.count = this.#count;
		} else {
			entry.count -= 1;
		}

		if (entry.count <= 0) {
			await this.#setRateLimiterCookie(event, cookieName, entry);
			return { success: false, remaining: 0 };
		}

		await this.#setRateLimiterCookie(event, cookieName, entry);
		return { success: true, remaining: entry.count };
	}

	async #setRateLimiterCookie(event: RequestEvent, cookieName: string, entry: RateLimitEntry) {
		const token = await encodeRateLimitCookie(entry);
		event.cookies.set(cookieName, token, {
			path: '/',
			httpOnly: true,
			expires: entry.expires
		});

		event.setHeaders({
			'X-RateLimit-Remaining': entry.count.toString(),
			'X-RateLimit-Reset': entry.expires.toISOString()
		});
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
