import { delay } from '$lib/svelte/utils.js';
import type { Handle, RequestEvent, RequestHandler } from '@sveltejs/kit';
import sharp from 'sharp';

const IS_DEV = process.env.NODE_ENV !== 'production';
const IMAGE_CACHE = new Map<string, ArrayBuffer>();
const MAX_IMAGE_WIDTH = 4096;

// Default cache id used it none is specified.
const CACHE_ID = 'ZDgzNGRjYzQtODE3NC00ZDQ2LTkzYzMtN2I2ZDcyMGEzMjZi';

// Default cache-control max-age used
const CACHE_MAX_AGE = 3600; // 1 hour

// This is in the order of priority, so webp will be used first if available
const IMAGE_FORMATS = ['webp', 'png', 'jpeg', 'avif'] as const;

export type ImageFormat = (typeof IMAGE_FORMATS)[number];

/**
 * Options for the image optimizer.
 */
export type OptimizeImageOptions = {
	/**
	 * An unique id used for generating the image `ETag`, this value should be unique
	 * and not dynamic.
	 *
	 * When this value changes the images with `ETag` generated using it, will be invalidated
	 * from the cache as well, so changing this value can be used to burst the cache.
	 *
	 * Busting the cache is not an immediate action and will take effect when the
	 * brower cache is cleared, by default images are cache for few hours.
	 */
	cacheId?: string;

	/**
	 * The allowed image origins.
	 */
	allowedOrigins: string[];

	/**
	 * Allowed image formats.
	 *
	 * @default
	 * ['webp', 'png', 'jpg', 'jpeg', 'avif']
	 */
	formats?: ImageFormat[];

	/**
	 * The endpoint for the image optimizer handler.
	 */
	endpoint?: string;

	/**
	 * Value used in the Cache-Control 'max-age',
	 * we recommend keeping this value as low as possible, so the browser
	 * cache can be burst easily.
	 *
	 * @default 3600 // (1 hour)
	 */
	cacheMaxAge?: number;
};

/**
 * A middleware to optimize images.
 * @param opts The options.
 */
export function optimizeImage(opts: OptimizeImageOptions): Handle {
	const endpoint = opts.endpoint || '/api/image';
	const handler = createImageOptimizerHandler(opts);

	return async ({ event, resolve }) => {
		const isImageOptimizerRequest =
			isImageRequest(event) && matchesPath(event.url.pathname, endpoint);

		if (isImageOptimizerRequest) {
			return handler(event);
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

/**
 * Create a request handler for optimize images.
 * @param opts The image optimizer options.
 */
export function createImageOptimizerHandler(
	opts: Omit<OptimizeImageOptions, 'endpoint'>
): RequestHandler {
	const {
		cacheId = CACHE_ID,
		allowedOrigins,
		formats = [...IMAGE_FORMATS],
		cacheMaxAge = CACHE_MAX_AGE
	} = opts;
	const originUrls = allowedOrigins.map((x) => new URL(x));

	if (!cacheId) {
		throw new Error('Cache ID is required and cannot be empty.');
	}

	return async (event) => {
		if (!isImageRequest(event)) {
			return new Response(null, { status: 405 });
		}

		const format = getAcceptedFormats(event, formats)[0];

		if (!format) {
			return Response.json({
				error: "Request do not include a valid image content-type in the 'Accept' header"
			});
		}

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
				return Response.json(
					{ error: 'Expected image quality between 0 and 100' },
					{ status: 400 }
				);
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
			const cachedImageBuffer = IMAGE_CACHE.get(rawUrl);

			if (cachedImageBuffer) {
				return cachedImageBuffer;
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
						'Content-Type': `image/${format}`
					}
				});
			}

			if (!res.ok) {
				throw Response.json({ error: 'Unable to fetch remote image' }, { status: 500 });
			}

			const imageBuffer = await res.arrayBuffer();
			IMAGE_CACHE.set(rawUrl, imageBuffer);
			return imageBuffer;
		}

		try {
			const isCached = IMAGE_CACHE.has(rawUrl);
			const eTag = await generateETag({ cacheId, url, width, quality });
			const ifNoneMatch = event.request.headers.get('If-None-Match');

			if (ifNoneMatch === eTag) {
				return new Response(null, {
					status: 304,
					headers: {
						'Cache-Control': `public, max-age=${cacheMaxAge}`,
						'Access-Control-Allow-Origin': '*',
						'Cache-Status': 'REVALIDATED',
						Vary: 'Content-Encoding',
						ETag: eTag
					}
				});
			}

			const imageBuffer = await getImage();
			const sharpImage = sharp(imageBuffer).resize({ width });

			let response: Response;

			switch (format) {
				case 'webp': {
					const buffer = await sharpImage.webp({ quality }).toBuffer();
					response = createImageResponse({ eTag, format, cacheMaxAge, buffer });
					break;
				}
				case 'png': {
					const buffer = await sharpImage.png({ quality }).toBuffer();
					response = createImageResponse({ eTag, format, cacheMaxAge, buffer });
					break;
				}
				case 'avif': {
					const buffer = await sharpImage.avif({ quality }).toBuffer();
					response = createImageResponse({ eTag, format, cacheMaxAge, buffer });
					break;
				}
				case 'jpeg': {
					const buffer = await sharpImage.jpeg({ quality }).toBuffer();
					response = createImageResponse({ eTag, format, cacheMaxAge, buffer });
					break;
				}
				default: {
					return Response.json({ error: `Invalid image format: ${format}` }, { status: 500 });
				}
			}

			// Additional headers
			response.headers.set('Cache-Status', isCached ? 'HIT' : 'MISS');

			// Send image response
			return response;
		} catch (err) {
			if (err instanceof Response) {
				return err;
			}

			console.error(err);
			return Response.json({ error: 'Failed to fetch image' }, { status: 500 });
		}
	};
}

function getAcceptedFormats(event: RequestEvent, formats: ImageFormat[]) {
	const acceptHeader = event.request.headers.get('Accept');

	if (!acceptHeader) {
		return [];
	}

	const acceptFormats = acceptHeader.split(',').map((x) => x.trim());

	if (acceptFormats.some((x) => x === 'image/*')) {
		return formats;
	}

	return formats.filter((format) => acceptFormats.some((x) => x === `image/${format}`));
}

function isImageRequest(event: RequestEvent) {
	const accept = event.request.headers.get('Accept');

	if (!accept) {
		return false;
	}

	// This is a dumb check to check if the request accept images
	const acceptImages = accept
		.split(',')
		.map((x) => x.trim())
		.some((x) => x.startsWith('image/'));

	return acceptImages && (event.request.method === 'GET' || event.request.method === 'HEAD');
}

type CreateImageResponseArgs = {
	eTag: string;
	format: ImageFormat;
	buffer: Buffer;
	cacheMaxAge: number;
};

function createImageResponse(args: CreateImageResponseArgs) {
	const { eTag, format, cacheMaxAge, buffer } = args;

	return new Response(buffer, {
		headers: {
			'Content-Type': `image/${format}`,
			'Cache-Control': `public, max-age=${cacheMaxAge}`,
			'Access-Control-Allow-Origin': '*',
			Vary: 'Content-Encoding',
			ETag: eTag
		}
	});
}

async function generateETag(args: {
	cacheId: string;
	url: URL;
	width: number | undefined;
	quality: number;
}) {
	const value = `${args.cacheId}:${args.url.toString()}:${args.width}:${args.quality}`;
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