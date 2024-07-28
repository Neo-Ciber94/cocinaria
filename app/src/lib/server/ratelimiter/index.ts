import type { RateLimiter } from './base';
import { CookieBasedRateLimiter } from './cookieBased';

// 10 request each 10 seconds
export const rateLimiter: RateLimiter = new CookieBasedRateLimiter({
	count: 10,
	windowMs: 30_000
});
