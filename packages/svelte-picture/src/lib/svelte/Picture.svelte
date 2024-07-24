<script lang="ts" context="module">
  import type { HTMLImgAttributes } from "svelte/elements";
  import type { ImageLoader } from "./loader.js";

  export type ImageProps =
    | {
        width: number;
        height: number;
        fill?: undefined;
      }
    | {
        width?: undefined;
        height?: undefined;
        fill?: true;
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
  };

  type HTMLImageProps = Omit<
    HTMLImgAttributes,
    "width" | "height" | "src" | "alt"
  >;
</script>

<script lang="ts">
  import { defaultImageLoader } from "./loader.js";";
  import { loadImage } from "./utils.js";
  type Props = BaseProps & HTMLImageProps;

  let {
    width = $bindable(),
    height = $bindable(),
    fill = $bindable(),
    src = $bindable(),
    alt = $bindable(),
    children,
    placeholderUrl,
    loader = defaultImageLoader,
    onload,
    onerror,
    loading = "lazy",
    quality,
    ...rest
  }: Props = $props();

  if (quality && !(quality > 0 && quality <= 100)) {
    throw new Error("quality must be between 0 and 100");
  }

  let isImageLoading = $state(true);

  const remoteUrl = $derived.by(() => {
    return loader({
      url: src,
      width: fill ? undefined : width,
      quality: quality ? undefined : quality,
    });
  });

  const getInitialImageUrl = () => remoteUrl;
  let imageUrl = $state(placeholderUrl ? placeholderUrl : getInitialImageUrl());

  $effect.pre(() => {
    if (children && isImageLoading === true) {
      loadImage(remoteUrl).finally(() => {
        isImageLoading = false;
      });
    }
  });

  const imageStyles = $derived.by(() => {
    if (fill) {
      return { width: "100%", height: "100%", position: "absolute" };
    }

    return { width: `${width}px`, height: `${height}px` };
  });
</script>

<img
  src={imageUrl}
  {alt}
  {loading}
  {width}
  {height}
  style:width={imageStyles.width}
  style:height={imageStyles.height}
  style:position={imageStyles.position}
  onload={(ev) => {
    isImageLoading = false;
    imageUrl = remoteUrl;
    onload?.(ev);
  }}
  onerror={(ev) => {
    isImageLoading = false;
    onerror?.(ev);
  }}
  {...rest}
/>
