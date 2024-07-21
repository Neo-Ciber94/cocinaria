import type { Auth } from '$lib/common/types';

let globalAuth = $state<Auth | null | undefined>();

export function setAuth(auth: Auth | null | undefined) {
	globalAuth = auth;
	return globalAuth;
}

export function useAuth() {
	return globalAuth;
}
