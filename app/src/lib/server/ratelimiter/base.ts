import type { RequestEvent } from '@sveltejs/kit';

export type RateLimiterResult = {
	success: boolean;
	remaining: number;
};

export abstract class RateLimiter {
	abstract limit(event: RequestEvent, key: string): Promise<RateLimiterResult>;
}
