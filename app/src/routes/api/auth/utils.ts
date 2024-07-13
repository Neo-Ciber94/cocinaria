import { redirect } from '@sveltejs/kit';

export const enum AuthError {
	InvalidState = 'InvalidState',
	CallbackError = 'CallbackError'
}

export function redirectToAuthError(err: AuthError): never {
	redirect(302, `/login?AuthError=${err}`);
}
