export type ImageLoaderProps = {
  url: string;
  width?: number;
  quality?: number;
};

export type ImageLoader = (props: ImageLoaderProps) => string;

export const defaultImageLoader: ImageLoader = (props) => {
  const searchParams = new URLSearchParams();

  searchParams.set("url", encodeURIComponent(props.url));

  if (props.width) {
    searchParams.set("width", String(props.width));
  }

  if (props.quality) {
    searchParams.set("quality", String(props.quality));
  }

  return `/api/image?${searchParams}`;
};
