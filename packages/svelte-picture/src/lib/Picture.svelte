<script lang="ts" context="module">
	import type { HTMLImgAttributes } from 'svelte/elements';
	import type { ImageLoader } from './imageLoader.js';

	export type ImageProps = {
		/**
		 * The image URL.
		 */
		src: string;

		/**
		 * The intrinsic width of the image in pixels. Must be an integer without a unit.
		 */
		width?: number;

		/**
		 * The intrinsic height of the image, in pixels. Must be an integer without a unit.
		 */
		height?: number;

		/**
		 * Defines text that can replace the image in the page.
		 */
		alt: string;

		/**
		 * A function that returns the image url.
		 */
		loader?: ImageLoader;

		/**
		 * The quality of the image, between 0 and 100.
		 */
		quality?: number;

		/**
		 * A fallback image.
		 */
		placeholderUrl?: string;

		/**
		 * The width to request the image instead of using the parameter `width`.
		 */
		widthOverride?: number;

		/**
		 * A delay to add while loading the image.
		 *
		 * This is supported by the default image loading and ONLY during development.
		 */
		delayMs?: number;
	};

	type HTMLImageProps = Omit<HTMLImgAttributes, 'width' | 'height' | 'src' | 'alt'>;

	export type PictureProps = ImageProps & HTMLImageProps;
</script>

<script lang="ts">
	import { getRemoteImageUrl, loadImage } from './utils.js';

	let {
		width = $bindable(),
		height = $bindable(),
		src = $bindable(),
		alt = $bindable(),
		widthOverride = $bindable(),
		placeholderUrl,
		delayMs,
		loader,
		onload,
		onerror,
		loading = 'lazy',
		quality,
		...rest
	}: PictureProps = $props();

	if (quality && !(quality > 0 && quality <= 100)) {
		throw new Error('quality must be between 0 and 100');
	}

	if (delayMs) {
		console.warn(
			`A 'delay' of ${delayMs}ms is being used while loading '${src}', this will only work during development`
		);
	}

	const remoteUrl = $derived.by(() => {
		return getRemoteImageUrl({ src, quality, width, widthOverride, loader });
	});

	const getInitialImageUrl = () => remoteUrl;

	// eslint says this is unused for some reason
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let isImageLoading = $state(true);
	let imageUrl = $state(placeholderUrl || getInitialImageUrl());

	$effect(() => {
		if (!isImageLoading) {
			imageUrl = remoteUrl;
		}
	});

	$effect(() => {
		if (!placeholderUrl) {
			return;
		}

		loadImage(remoteUrl)
			.catch(onerror)
			.then((value) => {
				const event = new Event('load');
				Object.defineProperty(event, 'currentTarget', { value });
				Object.defineProperty(event, 'target', { value });

				onload?.(event as Event & { currentTarget: EventTarget & Element });
			})
			.finally(() => {
				imageUrl = remoteUrl;
				isImageLoading = false;
			});
	});

	function handleLoad(ev: Event & { currentTarget: EventTarget & Element }) {
		isImageLoading = false;
		onload?.(ev);
	}

	function handleError(ev: Event & { currentTarget: EventTarget & Element }) {
		isImageLoading = false;
		onerror?.(ev);
	}
</script>

<img
	src={imageUrl}
	{loading}
	{width}
	{height}
	onload={handleLoad}
	onerror={handleError}
	{...rest}
/>
