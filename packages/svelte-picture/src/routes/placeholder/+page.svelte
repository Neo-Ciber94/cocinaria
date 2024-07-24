<script lang="ts">
	import Picture from '$lib/svelte/Picture.svelte';
	import { blurHashToDataURL } from './blurHashToDataURL.js';

	const base64Url = blurHashToDataURL(
		'+CHBb^~A00~V=x-nY6D%MHi^V?og00s;vetSOBOZD*xZ9uxu?bs:E1WA-:s+NaM|s:aJ'
	);
</script>

<Picture
	src="https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/f0c30e6c-fa5f-438d-b207-7da2376880bf/1759871112.jpeg"
	placeholderUrl={base64Url}
	alt="Nyanners"
	width={832}
	height={1216}
/>
