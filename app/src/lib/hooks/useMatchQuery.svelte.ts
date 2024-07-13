export function useMatchQuery(query: string, initialValue = false) {
	let isMatching = $state(initialValue);

	$effect(() => {
		const mq = window.matchMedia(query);
		isMatching = mq.matches;

		function handleChange(e: MediaQueryListEvent) {
			isMatching = e.matches;
		}

		mq.addEventListener('change', handleChange);
		return () => {
			mq.removeEventListener('change', handleChange);
		};
	});

	return {
		get matches() {
			return isMatching;
		}
	};
}
