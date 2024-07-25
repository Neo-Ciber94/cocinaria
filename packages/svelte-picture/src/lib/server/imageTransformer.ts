import { delay } from '$lib/utils.js';
import type { RequestHandler, RequestEvent } from '@sveltejs/kit';
import type { OptimizeImageOptions, ImageFormat } from './imageOptimizer.js';
import { transformImageFromURL, TransformImageError } from './transformImageFromURL.js';
import { generateETag } from './utils.js';

const IS_DEV = process.env.NODE_ENV !== 'production';

// This is just a hard limit
const MAX_IMAGE_WIDTH = 2048;

// Default cache id used it none is specified.
const CACHE_ID = 'ZDgzNGRjYzQtODE3NC00ZDQ2LTkzYzMtN2I2ZDcyMGEzMjZi';

// Default cache-control max-age used
const CACHE_MAX_AGE = 3600 * 3; // 3 hours

// This is in the order of priority, so webp will be used first if available
const IMAGE_FORMATS = ['webp', 'png', 'jpeg', 'avif'] as const;

/**
 * Create a request handler for transform images.
 * @param opts The image optimizer options.
 */
export function unsafe_createImageTransformerHandler(opts: OptimizeImageOptions): RequestHandler {
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

		let format = getAcceptedFormats(event, formats)[0];

		if (!format) {
			return Response.json({
				error: "Request do not include a valid image content-type in the 'Accept' header"
			});
		}

		const queryUrl = event.url.searchParams.get('url');
		const queryWidth = event.url.searchParams.get('width');
		const queryQuality = event.url.searchParams.get('quality');
		const queryFormat = event.url.searchParams.get('format');
		const queryDelayMs = event.url.searchParams.get('delay');

		if (!queryUrl) {
			return Response.json({ error: 'Missing image url' }, { status: 400 });
		}

		const rawUrl = decodeURIComponent(queryUrl);

		let url: URL | string;
		let width: number | undefined;
		let quality: number = 80;

		try {
			if (isRelativeUrl(rawUrl)) {
				url = rawUrl;
			} else {
				url = new URL(rawUrl);
				const isOriginAllowed = originUrls.some((x) => x.origin === (url as URL).origin);

				if (!isOriginAllowed) {
					return Response.json({ error: 'Invalid image url origin' }, { status: 403 });
				}
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

		if (queryFormat && isValidImageFormat(queryFormat)) {
			// If other format is required, we override it
			format = queryFormat;
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

		try {
			const eTag = await generateETag({ cacheId, url, width, format, quality });
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

			const transformed = await transformImageFromURL({
				fetcher: event.fetch,
				format,
				url,
				width,
				cacheMaxAge,
				quality
			});

			// Send image response
			return new Response(transformed.buffer, {
				headers: {
					'Content-Type': `image/${format}`,
					'Cache-Control': `public, max-age=${cacheMaxAge}`,
					'Access-Control-Allow-Origin': '*',
					'Cache-Status': transformed.cacheHit ? 'HIT' : 'MISS',
					Vary: 'Content-Encoding',
					ETag: eTag
				}
			});
		} catch (err) {
			if (err instanceof TransformImageError) {
				return Response.json({ error: err.message }, { status: err.status });
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

function isRelativeUrl(url: string) {
	// https://stackoverflow.com/a/19709846/9307869
	return !/^(?:[a-z+]+:)?\/\//i.test(url);
}

function isValidImageFormat(s: string): s is ImageFormat {
	return IMAGE_FORMATS.includes(s as ImageFormat);
}
