import type { Auth } from '$lib/common/types';

type UseAuth = Auth & {
	consumeCredit: () => void;
};

let globalAuth = $state<Auth | null | undefined>();

export function setAuth(auth: Auth | null | undefined) {
	globalAuth = auth;
	return globalAuth;
}

export function useAuth(): UseAuth | null | undefined {
	const result = $derived.by(() => {
		if (globalAuth == null) {
			return globalAuth;
		}

		return {
			get account() {
				return globalAuth!.account;
			},
			get user() {
				return globalAuth!.user;
			},
			get session() {
				return globalAuth!.session;
			},
			consumeCredit() {
				const newCredits = Math.max(0, globalAuth!.account.credits - 1);
				globalAuth!.account.credits = newCredits;
			}
		};
	});

	return result;
}
