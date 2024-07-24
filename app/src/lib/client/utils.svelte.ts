import { readable } from 'svelte/store';

export function runesToStore<T>(cb: () => T) {
	return readable<T>(cb(), (set) => {
		$effect.pre(() => set(cb()));
	});
}
