<script lang="ts">
  import { defaultImageLoader, type ImageLoader } from "./common.js";
  import type { HTMLImgAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  type ImageProps =
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
    loader?: ImageLoader;
    quality?: number;
    placeholderUrl?: string;
    children?: Snippet<[ImageProps]>;
  };

  type HTMLImageProps = Omit<
    HTMLImgAttributes,
    "width" | "height" | "src" | "alt"
  >;

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

  let imageLoading = $state(true);

  const remoteUrl = $derived.by(() => {
    return loader({
      url: src,
      width: fill ? undefined : width,
      quality: quality ? undefined : quality,
    });
  });

  const getInitialImageUrl = () => remoteUrl;
  let imageUrl = $state(placeholderUrl ? placeholderUrl : getInitialImageUrl());

  const imageStyles = $derived.by(() => {
    if (fill) {
      return { width: "100%", height: "100%", position: "absolute" };
    }

    return { width: `${width}px`, height: `${height}px` };
  });
</script>

{#if children && imageLoading}
  <div
    style:width={imageStyles.width}
    style:height={imageStyles.height}
    style:position={imageStyles.position}
  >
{@render children({ width, height, fill } as ImageProps)}
</div>
{:else}
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
      imageLoading = false;
      imageUrl = remoteUrl;
      onload?.(ev);
    }}
    onerror={(ev) => {
      imageLoading = false;
      onerror?.(ev);
    }}
    {...rest}
  />
{/if}
