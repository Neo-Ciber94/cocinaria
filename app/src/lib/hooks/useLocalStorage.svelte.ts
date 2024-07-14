import { z, type ZodType } from 'zod';

export type UseLocalStorageOptions<T> = {
	initialValue?: T;
	storage?: () => Storage;
	serializer?: {
		stringify: (value: T) => string;
		parse: (value: string) => T;
	};
};

export function useLocalStorage<TSchema extends ZodType>(
	key: string,
	schema: TSchema,
	options?: UseLocalStorageOptions<z.infer<TSchema>>
) {
	type Value = z.infer<TSchema>;

	const { initialValue, serializer = JSON, ...rest } = options || {};
	let value = $state<Value>(initialValue);
	let pending = $state(true);

	const storage = (() => {
		if (typeof window === 'undefined') {
			return {} as Storage;
		}

		if (rest.storage) {
			return rest.storage();
		}

		return localStorage;
	})();

	function setValue(jsonString: string | null) {
		if (jsonString == null) {
			value = initialValue;
		} else {
			const jsonValue = serializer.parse(jsonString);
			const result = schema.safeParse(jsonValue);
			if (result.success) {
				value = result.data;
			}
		}
	}

	$effect(() => {
		pending = true;

		try {
			const jsonString = storage.getItem(key);
			setValue(jsonString);
		} finally {
			pending = false;
		}
	});

	// Listen for local storage changes
	$effect(() => {
		function handleStorageChange(ev: StorageEvent) {
			if (ev.key === key && ev.storageArea === storage) {
				setValue(ev.newValue);
			}
		}

		window.addEventListener('storage', handleStorageChange);
		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	});

	return {
		get pending() {
			return pending;
		},
		get value() {
			return value;
		},
		set value(newValue: Value) {
			const jsonString = serializer.stringify(newValue);
			storage.setItem(key, jsonString);
			value = newValue;
		},
		delete() {
			storage.removeItem(key);
			value = initialValue;
		}
	};
}
