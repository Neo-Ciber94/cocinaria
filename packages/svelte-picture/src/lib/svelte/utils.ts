export function loadImage(src: string): Promise<HTMLImageElement> {
	const image = new Image();
	image.src = src;

	return new Promise<HTMLImageElement>((resolve, reject) => {
		image.onload = () => resolve(image);
		image.onerror = (ev) => reject(ev);
	});
}
