import sharp from 'sharp';
import type { ImageFormat } from './imageTransformer.js';

const IMAGE_CACHE = new Map<string, ArrayBuffer>();

type TransformImageOptions = {
	url: URL | string;
	width: number | undefined;
	quality: number;
	format: ImageFormat;
	fetcher: typeof globalThis.fetch;
	cacheMaxAge: number;
};

type TransformedImage = {
	buffer: Buffer;
	format: ImageFormat;
	cacheHit: boolean;
};

export class TransformImageError extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message);
	}
}

export async function transformImageFromURL(
	options: TransformImageOptions
): Promise<TransformedImage> {
	const { url, width, format, quality = 80, fetcher = globalThis.fetch } = options;

	const rawUrl = url.toString();

	async function getImage() {
		const cachedImageBuffer = IMAGE_CACHE.get(rawUrl);

		if (cachedImageBuffer) {
			return cachedImageBuffer;
		}

		const res = await fetcher(rawUrl, {
			headers: {
				Accept: 'image/*'
			}
		});

		if (res.status === 404) {
			throw new TransformImageError(404, 'Not found');
		}

		if (!res.ok) {
			throw new TransformImageError(500, 'Unable to fetch remote image');
		}

		const imageBuffer = await res.arrayBuffer();
		IMAGE_CACHE.set(rawUrl, imageBuffer);
		return imageBuffer;
	}

	const cacheHit = IMAGE_CACHE.has(rawUrl);
	const imageBuffer = await getImage();
	const sharpImage = sharp(imageBuffer).resize({ width });

	let buffer: Buffer;

	switch (format) {
		case 'webp': {
			buffer = await sharpImage.webp({ quality }).toBuffer();
			break;
		}
		case 'png': {
			buffer = await sharpImage.png({ quality }).toBuffer();
			break;
		}
		case 'avif': {
			buffer = await sharpImage.avif({ quality }).toBuffer();
			break;
		}
		case 'jpeg': {
			buffer = await sharpImage.jpeg({ quality }).toBuffer();
			break;
		}
		default: {
			throw new TransformImageError(500, `Invalid image format: ${format}`);
		}
	}

	return {
		buffer,
		format,
		cacheHit
	};
}
