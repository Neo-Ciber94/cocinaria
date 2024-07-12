<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<header>
	Username: {data.user?.username}
</header>
<main class="p-2">
	<slot />
</main>
