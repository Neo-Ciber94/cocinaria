import { COOKIE_AI_PROVIDER_KEY } from '$lib/common/constants';
import { error, type Cookies, type RequestEvent } from '@sveltejs/kit';
import { aiProviderKeySchema } from '../../routes/api/ai-provider/schema';

export function checkAuthenticated(event: RequestEvent) {
	if (event.locals.auth == null) {
		error(401, { message: 'Not authenticated' });
	}

	return event.locals.auth;
}

export function getAIProviderKey(cookies: Cookies) {
	const cookieValue = cookies.get(COOKIE_AI_PROVIDER_KEY);

	try {
		const result = aiProviderKeySchema.safeParse(cookieValue);
		return result.success ? result.data : null;
	} catch {
		return null;
	}
}
