import { delay } from '$lib/svelte/utils.js';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import sharp from 'sharp';

const IS_DEV = process.env.NODE_ENV !== 'production';

const IMAGE_CACHE = new Map<string, { imageBuffer: ArrayBuffer; responseETag: string | null }>();
const MAX_IMAGE_WIDTH = 4096;
const CONTENT_TYPES = ['png', 'webp'] as const;

export type ImageContentType = (typeof CONTENT_TYPES)[number];

/**
 * Options for the image optimizer.
 */
export type OptimizeImageOptions = {
	/**
	 * The allowed image origins.
	 */
	allowedOrigins: string[];

	/**
	 * The content type of the images.
	 *
	 * @default 'webp'
	 */
	contentType?: ImageContentType;

	/**
	 * The endpoint for the image optimizer handler.
	 */
	endpoint?: string;
};

/**
 * A middleware to optimize images.
 * @param opts The options.
 */
export function optimizeImage(opts: OptimizeImageOptions): Handle {
	const endpoint = opts.endpoint || '/api/image';

	return async ({ event, resolve }) => {
		const isImageOptimizerRequest =
			(event.request.method === 'GET' || event.request.method === 'HEAD') &&
			matchesPath(event.url.pathname, endpoint);

		if (isImageOptimizerRequest) {
			return createOptimizedImage(event, opts);
		}

		return resolve(event);
	};
}

function matchesPath(from: string, to: string) {
	function stripSlashes(arr: string[]) {
		if (arr[0] === '/') {
			arr.shift();
		}

		if (arr[arr.length - 1] === '/') {
			arr.pop();
		}

		return arr;
	}

	const sourceParts = stripSlashes(from.split('/'));
	const destParts = stripSlashes(to.split('/'));

	if (sourceParts.length !== destParts.length) {
		return false;
	}

	for (let i = 0; i < sourceParts.length; i++) {
		if (sourceParts[i] !== destParts[i]) {
			return false;
		}
	}

	return true;
}

async function createOptimizedImage(
	event: RequestEvent,
	opts: Omit<OptimizeImageOptions, 'endpoint'>
) {
	const { allowedOrigins, contentType = 'webp' } = opts;
	const originUrls = allowedOrigins.map((x) => new URL(x));

	const queryUrl = event.url.searchParams.get('url');
	const queryWidth = event.url.searchParams.get('width');
	const queryQuality = event.url.searchParams.get('quality');
	const queryDelayMs = event.url.searchParams.get('delay');

	if (!queryUrl) {
		return Response.json({ error: 'Missing image url' }, { status: 400 });
	}

	const rawUrl = decodeURIComponent(queryUrl);

	let url: URL;
	let width: number | undefined;
	let quality: number = 80;

	try {
		url = new URL(rawUrl);

		const isOriginAllowed = originUrls.some((x) => x.origin === url.origin);

		if (!isOriginAllowed) {
			return Response.json({ error: 'Invalid image url origin' }, { status: 403 });
		}
	} catch (err) {
		console.error(err);
		return Response.json({ error: 'Invalid image url' }, { status: 400 });
	}

	if (queryWidth) {
		width = parseFloat(queryWidth);

		if (Number.isNaN(width)) {
			return Response.json({ error: 'Invalid image width' }, { status: 400 });
		}

		if (width <= 0 || width > MAX_IMAGE_WIDTH) {
			return Response.json(
				{
					error: `Image width must be positive and lower than ${MAX_IMAGE_WIDTH}`
				},
				{ status: 400 }
			);
		}
	}

	if (queryQuality) {
		quality = parseInt(queryQuality);

		if (Number.isNaN(quality)) {
			return Response.json({ error: 'Invalid image quality' }, { status: 400 });
		}

		if (!(quality >= 0 && quality <= 100)) {
			return Response.json({ error: 'Expected image quality between 0 and 100' }, { status: 400 });
		}
	}

	if (queryDelayMs) {
		console.warn(
			`A 'delay' of ${queryDelayMs}ms is being used while loading '${rawUrl}', this will only work during development`
		);

		if (IS_DEV) {
			const delayMs = parseFloat(queryDelayMs);

			if (!Number.isNaN(delayMs)) {
				await delay(delayMs);
			}
		}
	}

	async function getImage() {
		const cached = IMAGE_CACHE.get(rawUrl);

		if (cached) {
			return {
				imageBuffer: cached.imageBuffer,
				responseETag: cached.responseETag
			};
		}

		const res = await fetch(url, {
			headers: {
				Accept: 'image/*'
			}
		});

		if (res.status === 404) {
			throw new Response(null, {
				status: 404,
				headers: {
					'Content-Type': `image/${contentType}`
				}
			});
		}

		if (!res.ok) {
			throw Response.json({ error: 'Unable to fetch remote image' }, { status: 500 });
		}

		const imageBuffer = await res.arrayBuffer();
		const responseETag = res.headers.get('ETag');
		IMAGE_CACHE.set(rawUrl, { imageBuffer, responseETag });
		return { imageBuffer, responseETag };
	}

	try {
		const result = await getImage();
		const { imageBuffer, responseETag } = result;
		const eTag = responseETag || generateETag({ url, width, quality });
		const sharpImage = sharp(imageBuffer).resize({ width });

		let response: Response;

		switch (contentType) {
			case 'webp': {
				const buffer = await sharpImage.webp({ quality }).toBuffer();
				response = createImageResponse({ eTag, contentType, buffer });
				break;
			}
			case 'png': {
				const buffer = await sharpImage.png({ quality }).toBuffer();
				response = createImageResponse({ eTag, contentType, buffer });
				break;
			}
			default: {
				return Response.json({ error: `Invalid image format: ${contentType}` }, { status: 500 });
			}
		}

		// Additional headers
		response.headers.set('Cache-Status', IMAGE_CACHE.has(rawUrl) ? 'HIT' : 'MISS');

		// Send image response
		return response;
	} catch (err) {
		if (err instanceof Response) {
			return err;
		}

		console.error(err);
		return Response.json({ error: 'Failed to fetch image' }, { status: 500 });
	}
}

type CreateImageResponseArgs = {
	eTag: string;
	contentType: ImageContentType;
	buffer: Buffer;
};

function createImageResponse(args: CreateImageResponseArgs) {
	const { eTag, contentType, buffer } = args;

	return new Response(buffer, {
		headers: {
			'Content-Type': `image/${contentType}`,
			'Cache-Control': 'public, max-age=31557600',
			'Access-Control-Allow-Origin': '*',
			Vary: 'Content-Encoding',
			ETag: eTag
		}
	});
}

function generateETag(args: { url: URL; width: number | undefined; quality: number }) {
	const value = `${args.url.toString()}:${args.width}:${args.quality}`;
	return btoa(value).replaceAll('=', '');
}
