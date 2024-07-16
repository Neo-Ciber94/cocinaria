// See https://kit.svelte.dev/docs/types#app

import type { Auth } from '$lib/common/types';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			auth: Auth | null;
		}

		interface Error {
			message: string;
		}

		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
