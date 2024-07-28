import { COOKIE_AI_PROVIDER_KEY } from '$lib/common/constants';
import { getFoodIcon } from '$lib/hooks/foodIcon';
import type { Cookies } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { aiProviderConfig } from './api/ai/provider/schema';
import { getBaseUrl } from '$lib/common/getBaseUrl';

export const load: LayoutServerLoad = async (event) => {
	const auth = event.locals.auth;
	const icon = getFoodIcon(event);
	const aiProvider = getAIProvider(event.cookies);
	const seo = {
		image: `${getBaseUrl()}/icons/cocinaria-512x512.png`
	};

	return { auth, icon, aiProvider, seo };
};

function getAIProvider(cookies: Cookies) {
	const cookieValue = cookies.get(COOKIE_AI_PROVIDER_KEY);

	if (!cookieValue) {
		return null;
	}

	try {
		const json = JSON.parse(cookieValue);
		const result = aiProviderConfig.safeParse(json);

		if (result.success) {
			return result.data.aiProvider;
		}

		return null;
	} catch (err) {
		console.error(err);

		// We delete just to be sure
		cookies.delete(COOKIE_AI_PROVIDER_KEY, { path: '/' });
		return null;
	}
}
