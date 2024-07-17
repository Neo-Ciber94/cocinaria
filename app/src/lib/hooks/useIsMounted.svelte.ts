export function useIsMounted() {
	let mounted = $state(false);

	$effect(() => {
		mounted = true;
	});

	return {
		get value() {
			return mounted;
		}
	};
}
