<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';
	import { Toaster } from 'svelte-french-toast';
	import UserAvatar from './UserAvatar.svelte';
	import { page } from '$app/stores';
	import { setFoodIcon } from '$lib/hooks/useFoodIcon';
	import { setAuth } from '$lib/hooks/useAuth';
	import SearchIcon from '$components/icons/searchIcon.svelte';
	import CookingIcon from '$components/icons/cookingIcon.svelte';

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
			class="font-medium text-neutral-600 group min-w-[90px] text-center p-2 rounded-md hover:bg-orange-500 hover:text-white flex flex-row items-center gap-2"
			data-active={false}
		>
			<SearchIcon class="size-5 group-hover:opacity-100 opacity-50" />
			<span> Explore </span>
		</a>
		<a
			href="/"
			class="font-medium text-neutral-600 group min-w-[90px] text-center p-2 rounded-md hover:bg-orange-500 hover:text-white flex flex-row items-center gap-2"
			data-active={false}
		>
			<CookingIcon class="size-5 group-hover:opacity-100 opacity-50" />
			<span> My Recipes </span>
		</a>
	</div>

	{#if user}
		<UserAvatar {user} />
	{:else if !isLoginPage}
		<a
			href="/login"
			class="font-bold text-white bg-orange-500 hover:bg-orange-600 px-8 py-2 shadow-md rounded-lg flex flex-row gap-2 items-center"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8z"
				/>
			</svg>

			<span> Login </span>
		</a>
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
