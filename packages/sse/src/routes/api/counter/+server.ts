import { stream } from '$lib';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async () => {
	return stream(({ emit, close }) => {
		let count = 0;

		const interval = setInterval(() => {
			if (count > 5) {
				return close();
			}

			const data = (count++).toString();
			emit('increment', data);
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
};
