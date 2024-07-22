import { NOT_FOUND_IMAGE } from '$lib/common/constants';

/**
 * A handle to recover from image loading errors
 */
export function handleImageError(ev: Event) {
	const img = ev.currentTarget as HTMLImageElement;

	if (!(img instanceof HTMLImageElement)) {
		console.warn("'handleImageError' must be used in an HTMLImageElement");
		return;
	}

	img.src = NOT_FOUND_IMAGE;
}
