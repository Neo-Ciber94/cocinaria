<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';
	import { Toaster } from 'svelte-french-toast';
	import { setFoodIcon } from '$lib/hooks/useFoodIcon';
	import { setAuth } from '$lib/hooks/useAuth';
	import Header from './Header.svelte';

	export let data: LayoutData;

	setAuth(data.auth);
	setFoodIcon(data.icon);

	const icon = data.icon;
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

<Header />
<main class="p-4 h-[calc(100vh-var(--header-height)-var(--footer-height))] w-full">
	<slot />
</main>

<footer
	class="h-[var(--footer-height)] flex flex-row justify-center items-center text-black border-t border-gray-200"
>
	<p>
		<span> &copy; </span>
		<span>Copyleft</span>
	</p>
</footer>

<!-- <div
	class="fixed select-none pointer-events-none -z-10 top-0 left-0 pattern-cross pattern-orange-500 pattern-bg-white pattern-size-6 pattern-opacity-20 w-full h-full"
></div> -->

<Toaster />
