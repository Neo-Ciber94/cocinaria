import { getCookie, removeCookie, setCookie } from '$lib/client/cookies';
import { aiProviderSchema } from '$lib/common/types';
import { z } from 'zod';

const apiKeySchema = z.object({
	key: z.string(),
	provider: aiProviderSchema
});

// TODO: Evalute if makes sense to keep the key in a client side cookie,
// or make a round to the server to set it as an http-only cookie.
// The cookie either way will transmited over HTTPS

type APIKey = Readonly<z.infer<typeof apiKeySchema>>;

const COOKIE_CLIENT_API_KEY = 'cocinaria-api-key';

let clientAPIKey = $state<APIKey | null>(null);

$effect.root(() => {
	const raw = getCookie(COOKIE_CLIENT_API_KEY);
	const result = apiKeySchema.safeParse(raw);

	if (result.success) {
		clientAPIKey = Object.freeze(result.data);
	} else {
		// We remove the cookie just to be sure we don't pick it again
		removeCookie(COOKIE_CLIENT_API_KEY);
		clientAPIKey = null;
	}
});

export function useApiKey() {
	return {
		get value() {
			return clientAPIKey;
		},
		set value(apiKey: APIKey | null) {
			if (apiKey == null) {
				clientAPIKey = null;
				removeCookie(COOKIE_CLIENT_API_KEY);
			} else {
				clientAPIKey = Object.freeze(apiKey);
				setCookie(COOKIE_CLIENT_API_KEY, JSON.stringify(clientAPIKey));
			}
		}
	};
}
