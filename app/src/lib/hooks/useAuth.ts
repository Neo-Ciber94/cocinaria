import type { Auth } from '$lib/common/types';
import { getContext, setContext } from 'svelte';

const AUTH_CONTEXT = Symbol('AUTH_CONTEXT');

export function setAuth(auth: Auth | null | undefined) {
	return setContext(AUTH_CONTEXT, auth);
}

export function useAuth() {
	return getContext(AUTH_CONTEXT) as ReturnType<typeof setAuth>;
}
