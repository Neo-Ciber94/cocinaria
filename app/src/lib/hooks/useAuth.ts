import type { Session, User } from 'lucia';
import { getContext, setContext } from 'svelte';

const AUTH_CONTEXT = Symbol('AUTH_CONTEXT');

type Auth = {
	session: Session;
	user: User;
};

export function setAuth(auth: Auth | null | undefined) {
	return setContext(AUTH_CONTEXT, auth);
}

export function useAuth() {
	return getContext(AUTH_CONTEXT) as ReturnType<typeof setAuth>;
}
