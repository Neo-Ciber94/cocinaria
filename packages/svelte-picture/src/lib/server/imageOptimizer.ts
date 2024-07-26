import type { Handle, RequestHandler } from '@sveltejs/kit';
import { isGetOrHeadRequest } from './utils.js';
import {
	unsafe_createImageTransformerHandler,
	type CreateImageTransformerOptions
} from './imageTransformer.js';

/**
 * Options for the image optimizer.
 */
export type ImageOptimizerOptions = Omit<CreateImageTransformerOptions, 'getImageUrl'> & {
	/**
	 * The endpoint for the image optimizer handler.
	 */
	endpoint?: string;
};

/**
 * A middleware to optimize images.
 * @param opts The options.
 */
export function optimizeImage(opts: ImageOptimizerOptions): Handle {
	const endpoint = opts.endpoint || '/api/image';
	const handler = createImageOptimizerHandler(opts);

	return async ({ event, resolve }) => {
		const isImageOptimizerRequest =
			isGetOrHeadRequest(event) && matchesPath(event.url.pathname, endpoint);

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
 * @param options The image optimizer options.
 */
export function createImageOptimizerHandler(
	options: Omit<ImageOptimizerOptions, 'endpoint'>
): RequestHandler {
	return unsafe_createImageTransformerHandler({
		...options,
		getImageUrl(event) {
			const url = event.url.searchParams.get('url');

			if (url) {
				return decodeURIComponent(url);
			}

			return url;
		}
	});
}
