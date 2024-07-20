import { stream } from '$lib/index.js';
import type { RequestHandler } from './$types.js';
import { type CounterEvents } from './types.js';

export const POST: RequestHandler = async () => {
	return stream<CounterEvents>(({ emit, close }) => {
		let count = 0;

		const interval = setInterval(() => {
			if (count > 5) {
				return close();
			}

			emit('increment', count++);
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
};
