<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

{#if data.user}
	<h1>Username: {data.user}</h1>
	<a href="/api/auth/logout">Logout</a>
{:else}
	<a href="/login" class="text-2xl font-bold">Go to Login</a>
{/if}
