import type { RateLimiter } from './base';
import { CookieBasedRateLimiter } from './cookie.ratelimiter';

// 10 request each 10 seconds
export const rateLimiter: RateLimiter = new CookieBasedRateLimiter({
	max: 10,
	windowMs: 10_000
});
