<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<header class="flex flex-row p-4 items-center w-full min-h-16 shadow-lg border-b border-gray-200">
	Username: {data.user?.username}
</header>

<main class="p-2">
	<slot />
</main>
