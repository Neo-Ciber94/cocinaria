<script lang="ts" context="module">
	import type { HTMLImgAttributes } from 'svelte/elements';
	import type { ImageLoader } from './loader.js';

	export type ImageProps = {
		width?: number;
		height?: number;
	};

	type BaseProps = ImageProps & {
		src: string;
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
		 * A delay to add while loading the image.
		 *
		 * This is supported by the default image loading and ONLY during development.
		 */
		delayMs?: number;
	};

	type HTMLImageProps = Omit<HTMLImgAttributes, 'width' | 'height' | 'src' | 'alt'>;

	export type PictureProps = BaseProps & HTMLImageProps;
</script>

<script lang="ts">
	import { defaultImageLoader } from './loader.js';
	import { loadImage } from './utils.js';

	let {
		width = $bindable(),
		height = $bindable(),
		src = $bindable(),
		alt = $bindable(),
		placeholderUrl,
		delayMs,
		loader = defaultImageLoader,
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
		return loader({ url: src, width, quality });
	});

	const getInitialImageUrl = () => remoteUrl;
	let imageUrl = $state(placeholderUrl || getInitialImageUrl());

	// eslint says this is unused for some reason
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let isImageLoading = $state(true);

	$effect.pre(() => {
		if (!placeholderUrl) {
			return;
		}

		loadImage(remoteUrl)
			.catch(onerror)
			.then((img) => {
				const event = Object.defineProperty(new Event('load', {}), 'currentTarget', {
					value: img
				}) as Event & { currentTarget: EventTarget & Element };
				onload?.(event);
			})
			.finally(() => {
				imageUrl = remoteUrl;
				isImageLoading = false;
			});
	});

	function handleLoad(ev: Event & { currentTarget: EventTarget & Element }) {
		if (!placeholderUrl) {
			isImageLoading = false;
			imageUrl = remoteUrl;
		}

		onload?.(ev);
	}

	function handleError(ev: Event & { currentTarget: EventTarget & Element }) {
		if (!placeholderUrl) {
			isImageLoading = false;
		}

		onerror?.(ev);
	}
</script>

<img
	src={imageUrl}
	{alt}
	{loading}
	{width}
	{height}
	onload={handleLoad}
	onerror={handleError}
	{...rest}
/>
