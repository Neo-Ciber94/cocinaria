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
			class="font-medium text-neutral-600 group min-w-[90px] text-center p-2 rounded-md hover:bg-orange-500 hover:text-white flex flex-row items-center gap-2"
			data-active={false}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-5 group-hover:opacity-100 opacity-50"
				viewBox="0 0 24 24"
			>
				<g
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21l-4.3-4.3" />
				</g>
			</svg>
			<span> Explore </span>
		</a>
		<a
			href="/"
			class="font-medium text-neutral-600 group min-w-[90px] text-center p-2 rounded-md hover:bg-orange-500 hover:text-white flex flex-row items-center gap-2"
			data-active={false}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-5 group-hover:opacity-100 opacity-50"
				viewBox="0 0 24 24"
			>
				<path
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M2 12h20m-2 0v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8m0-4l16-4M8.86 6.78l-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"
				/>
			</svg>

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
