// See https://kit.svelte.dev/docs/types#app

import type { Session, User } from 'lucia';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			auth: {
				user: User;
				session: Session;
			} | null;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
