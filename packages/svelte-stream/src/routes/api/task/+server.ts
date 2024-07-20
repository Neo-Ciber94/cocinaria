import { task } from '$lib/task/task.js';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async (event) => {
	const { n } = await event.request.json();

	if (typeof n !== 'number') {
		error(400, 'Input is not a number');
	}

	return task(async () => {
		await delay(1000);
		return isPrime(n);
	});
};

function delay(ms: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function isPrime(n: number) {
	if (n <= 1) return false;

	for (let i = 2; i < n; i++) {
		if (n % i === 0) {
			return false;
		}
	}

	return true;
}
