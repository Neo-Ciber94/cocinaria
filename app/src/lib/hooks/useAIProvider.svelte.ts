import type { AIProvider } from '$lib/common/types';

let localAIProvider = $state<AIProvider | null>(null);

export function useAIProvider() {
	return {
		get value() {
			return localAIProvider;
		},
		set value(value: AIProvider | null) {
			localAIProvider = value;
		}
	};
}
