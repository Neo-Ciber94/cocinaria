import { env } from '$env/dynamic/private';

export function getBaseUrl() {
	if (env.ORIGIN) {
		return env.ORIGIN;
	}

	// FIXME?: Use VERCEL_PROJECT_PRODUCTION_URL instead?
	// https://vercel.com/docs/projects/environment-variables/system-environment-variables#system-environment-variables
	if (env.VERCEL_URL) {
		return `https://${env.VERCEL_URL}`;
	}

	const port = getPort();
	return `http://localhost:${port}`;
}

function getPort() {
	// Default vite port
	const defaultPort = 5173;

	if (env.PORT) {
		const port = parseInt(env.PORT);
		return Number.isInteger(port) ? port : defaultPort;
	}

	return defaultPort;
}
