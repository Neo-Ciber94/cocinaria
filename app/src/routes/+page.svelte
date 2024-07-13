<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	const user = data.auth?.user;
</script>

<div
	class="w-full h-[calc(100vh-var(--header-height)*2)] flex flex-col justify-center items-center"
>
	{#if user}
		<h1>Username: {user.username}</h1>
		<a href="/api/auth/logout">Logout</a>
	{:else}
		<a href="/login" class="text-2xl font-bold">Go to Login</a>
	{/if}
</div>
