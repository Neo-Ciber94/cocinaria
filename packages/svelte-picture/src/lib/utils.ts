import { defaultImageLoader, type ImageLoader } from './imageLoader.js';

export type GetRemoteImageUrlProps = {
	src: string;
	loader: ImageLoader | undefined;
	quality: number | undefined;
	width: number | undefined;
	widthOverride: number | undefined;
};

/**
 * Get the url for loading an image.
 */
export function getRemoteImageUrl(props: GetRemoteImageUrlProps) {
	const loader = props.loader || defaultImageLoader;
	const url = props.src;
	const width = props.widthOverride ?? props.width;
	const quality = props.quality;
	return loader({ url, width, quality });
}

/**
 * @internal
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
	const image = new Image();
	image.src = src;

	return new Promise<HTMLImageElement>((resolve, reject) => {
		image.onload = () => resolve(image);
		image.onerror = (ev) => reject(ev);
	});
}

/**
 * @internal
 */
export function delay(ms: number) {
	return new Promise<void>((resolve) => setTimeout(() => resolve, ms));
}
