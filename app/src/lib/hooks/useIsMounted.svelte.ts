export function useIsMounted() {
	let mounted = $state(false);

	$effect(() => {
		mounted = true;

		return () => {
			mounted = false;
		};
	});

	return {
		get value() {
			return mounted;
		}
	};
}
