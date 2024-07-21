/* eslint-disable @typescript-eslint/no-explicit-any */
export function debounce<F extends (...args: any[]) => void>(f: F, delayMs: number) {
	let timeout: number;

	return (...args: any[]) => {
		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = window.setTimeout(() => f(...args), delayMs);
	};
}
