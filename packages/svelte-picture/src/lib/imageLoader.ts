/**
 * Props for an image loader.
 */
export type ImageLoaderProps = {
	/**
	 * URL of the image.
	 */
	url: string;

	/**
	 * The width to resize the image to.
	 */
	width?: number;

	/**
	 * The quality of the image.
	 */
	quality?: number;
};

/**
 * Returns the URL for the image to load.
 */
export type ImageLoader = (props: ImageLoaderProps) => string;

/**
 * The default image loader.
 */
export const defaultImageLoader: ImageLoader = (props) => {
	const searchParams = new URLSearchParams();

	searchParams.set('url', encodeURIComponent(props.url));

	if (props.width) {
		searchParams.set('width', String(props.width));
	}

	if (props.quality) {
		searchParams.set('quality', String(props.quality));
	}

	return `/api/image?${searchParams}`;
};
