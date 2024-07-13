<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';
	import { Toaster } from 'svelte-french-toast';
	import UserAvatar from './UserAvatar.svelte';

	export let data: LayoutData;
</script>

<header
	class="flex flex-row p-4 items-center justify-between w-full min-h-16 shadow-lg border-b border-gray-200"
>
	<h1 class="text-2xl font-bold">
		<span> Cociner </span>
		<span> IA </span>
	</h1>

	{#if data.user}
		<UserAvatar user={data.user} />
	{/if}
</header>

<main class="p-2">
	<slot />
</main>

<Toaster />
