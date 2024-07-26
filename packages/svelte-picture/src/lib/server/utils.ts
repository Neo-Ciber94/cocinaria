import type { RequestEvent } from '@sveltejs/kit';

export function isGetOrHeadRequest(event: RequestEvent) {
	return event.request.method === 'GET' || event.request.method === 'HEAD';
}

export async function generateETag(args: {
	cacheId: string;
	url: URL | string;
	width: number | undefined;
	quality: number;
	format: string;
}) {
	const { cacheId, url, width, format, quality } = args;
	const value = `${cacheId}:${url.toString()}:${width}:${format}:${quality}`;
	return createSHA1Hash(value);
}

const encoder = new TextEncoder();

async function createSHA1Hash(message: string) {
	const data = encoder.encode(message);
	const hashBuffer = await crypto.subtle.digest('SHA-1', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
}
