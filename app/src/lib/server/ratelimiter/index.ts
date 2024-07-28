import type { RequestEvent } from '@sveltejs/kit';
import { CookieBasedRateLimiter } from './cookieBased';

export type RateLimiterResult = {
	success: boolean;
	remaining: number;
};

export abstract class RateLimiter {
	abstract limit(event: RequestEvent, key: string): Promise<RateLimiterResult>;
}

// 10 request each 10 seconds
export const rateLimiter: RateLimiter = new CookieBasedRateLimiter({
	count: 10,
	windowMs: 10_000
});
