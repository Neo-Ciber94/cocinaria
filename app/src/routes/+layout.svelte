<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';
	import { Toaster } from 'svelte-french-toast';
	import UserAvatar from './UserAvatar.svelte';
	import { page } from '$app/stores';
	import { setFoodIcon } from '$lib/hooks/useFoodIcon';
	import { setAuth } from '$lib/hooks/useAuth';

	export let data: LayoutData;

	const isLoginPage = $page.url.pathname === '/login';
	const icon = setFoodIcon(data.icon);

	setAuth(data.auth);

	const user = data.auth?.user;
</script>

<svelte:head>
	<title>CocinarIA {icon}</title>

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Sofia+Sans:ital,wght@0,1..1000;1,1..1000&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<header class="flex flex-row p-4 items-center justify-between w-full h-[var(--header-height)]">
	<a class="text-2xl font-bold flex flex-row justify-center font-mono text-orange-500" href="/">
		<span>Cocinar</span>
		<span class="text-emerald-500">IA</span>
		<span>{icon}</span>
	</a>

	<div class="flex flex-row h-full items-center gap-4">
		<a
			href="/"
			class="font-medium text-neutral-600 min-w-[90px] text-center p-2 rounded-md hover:bg-orange-500 hover:text-white"
			data-active={false}>Explore</a
		>
		<a
			href="/"
			class="font-medium text-neutral-600 min-w-[90px] text-center p-2 rounded-md hover:bg-orange-500 hover:text-white"
			data-active={false}>My Recipes</a
		>
	</div>

	{#if user}
		<UserAvatar {user} />
	{:else if !isLoginPage}
		<a
			href="/login"
			class="font-bold text-white bg-orange-500 hover:bg-orange-600 px-8 py-2 shadow-md rounded-lg"
			>Login</a
		>
	{:else}
		<div></div>
	{/if}
</header>

<main class="p-4">
	<slot />
</main>

<!-- <div
	class="fixed select-none pointer-events-none -z-10 top-0 left-0 pattern-cross pattern-orange-500 pattern-bg-white pattern-size-6 pattern-opacity-20 w-full h-full"
></div> -->

<Toaster />
