<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';

	// let props = $props();
	let props: HTMLImgAttributes = $props();
</script>

<img {...props} />
