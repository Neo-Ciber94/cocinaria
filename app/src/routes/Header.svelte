<script lang="ts">
	import { page } from '$app/stores';
	import CookingIcon from '$components/icons/cookingIcon.svelte';
	import SearchIcon from '$components/icons/searchIcon.svelte';
	import { useAuth } from '$lib/hooks/useAuth';
	import { useFoodIcon } from '$lib/hooks/useFoodIcon';
	import UserAvatar from './UserAvatar.svelte';

	const isLoginPage = $page.url.pathname === '/login';
	const icon = useFoodIcon();
	const auth = useAuth();

	const user = auth?.user;
</script>

<header class="flex flex-row px-4 items-center justify-between w-full h-[var(--header-height)]">
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
