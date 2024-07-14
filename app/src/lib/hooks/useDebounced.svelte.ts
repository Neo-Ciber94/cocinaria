export function useDebounce<T>(currentValue: () => T, delayMs: number) {
	let value = $state(currentValue());

	$effect(() => {
		const val = currentValue();
		if (val === value) {
			return;
		}

		const timeout = window.setTimeout(() => {
			value = val;
		}, delayMs);

		return () => {
			clearTimeout(timeout);
		};
	});

	return {
		get value() {
			return value;
		}
	};
}
