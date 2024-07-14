import { z, type ZodType } from 'zod';

export type UseLocalStorageOptions<T> = {
	initialValue?: T | (() => T);
	storage?: () => Storage;
	serializer?: {
		stringify: (value: T) => string;
		parse: (value: string) => T;
	};
	onChange?: (newValue: T) => void;
};

export function useLocalStorage<TSchema extends ZodType>(
	key: string,
	schema: TSchema,
	options?: UseLocalStorageOptions<z.infer<TSchema>>
) {
	type TValue = z.infer<TSchema>;

	const { initialValue, onChange, serializer = JSON, ...rest } = options || {};

	const getInitial = () => {
		if (initialValue == null) {
			return initialValue;
		}

		return initialValue instanceof Function ? initialValue() : initialValue;
	};

	const storage = getStorage(rest.storage);
	let value = $state<TValue>(getInitial());
	let pending = $state(true);

	function updateValue(newValue: TValue) {
		value = newValue;

		if (onChange) {
			onChange(newValue);
		}
	}

	function readValueFromStorage(s?: string | null) {
		const jsonString = s === undefined ? storage.getItem(key) : s;
		let newValue: TValue = getInitial();

		if (jsonString != null) {
			try {
				const jsonValue = serializer.parse(jsonString);
				const result = schema.safeParse(jsonValue);
				if (result.success) {
					newValue = result.data;
				}
			} catch {
				// ignore
			}
		}

		updateValue(newValue);
	}

	$effect.root(() => {
		pending = true;

		try {
			readValueFromStorage();
		} finally {
			pending = false;
		}
	});

	// Listen for local storage changes
	$effect(() => {
		function handleStorageChange(ev: StorageEvent) {
			if (ev.key === key && ev.storageArea === storage) {
				readValueFromStorage(ev.newValue);
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
		set value(newValue: TValue) {
			const jsonString = serializer.stringify(newValue);
			storage.setItem(key, jsonString);
			updateValue(newValue);
		},
		remove() {
			storage.removeItem(key);
			value = getInitial();
		}
	};
}

function getStorage(initialStorage: (() => Storage) | undefined) {
	if (typeof window === 'undefined') {
		return {} as Storage;
	}

	if (initialStorage) {
		return initialStorage();
	}

	return localStorage;
}
