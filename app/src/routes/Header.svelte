<script lang="ts">
	import { page } from '$app/stores';
	import CookingIcon from '$components/icons/cookingIcon.svelte';
	import SearchIcon from '$components/icons/searchIcon.svelte';
	import { useAuth } from '$lib/hooks/useAuth';
	import { useFoodIcon } from '$lib/hooks/useFoodIcon';
	import { derived } from 'svelte/store';
	import UserAvatar from './UserAvatar.svelte';
	import MenuIcon from '$components/icons/menuIcon.svelte';
	import { DropdownMenu } from 'bits-ui';
	import { linear } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { useMatchQuery } from '$lib/hooks/useMatchQuery.svelte';
	import SparkIcon from '$components/icons/sparkIcon.svelte';
	import GithubAnimatedIcon from '$components/icons/githubAnimatedIcon.svelte';

	const isLoginPage = derived(
		page,
		($p) => $p.url.pathname.split('/').filter(Boolean)[0] === 'login'
	);

	const icon = useFoodIcon();
	const auth = useAuth();

	const user = auth?.user;
	const isSmallScreenQuery = useMatchQuery('(max-width: 768px)');
	let isMenuOpen = $state(false);

	$effect(() => {
		if (!isSmallScreenQuery.matches) {
			isMenuOpen = false;
		}
	});
</script>

<header class="flex flex-row px-4 items-center justify-between w-full h-[var(--header-height)]">
	<a class="text-2xl font-bold flex flex-row justify-center font-mono text-orange-500" href="/">
		<span>Cocinar</span>
		<span class="text-emerald-500">IA</span>
		<span>{icon}</span>
	</a>

	<div class="md:flex flex-row h-full items-center gap-4 hidden">
		<a
			href="/explore"
			class="font-medium text-neutral-600 group min-w-[90px] text-center p-2 rounded-md hover:bg-orange-500 hover:text-white flex flex-row items-center gap-1"
			data-active={false}
		>
			<SearchIcon class="size-5 group-hover:opacity-100 opacity-50" />
			<span> Explore </span>
		</a>
		<a
			href="/my-recipes"
			class="font-medium text-neutral-600 group min-w-[90px] text-center p-2 rounded-md hover:bg-orange-500 hover:text-white flex flex-row items-center gap-1"
			data-active={false}
		>
			<CookingIcon class="size-5 group-hover:opacity-100 opacity-50" />
			<span> My Recipes </span>
		</a>
		<a
			href="/generate"
			class="font-medium text-neutral-600 group min-w-[90px] text-center p-2 rounded-md hover:bg-orange-500 hover:text-white flex flex-row items-center gap-1"
			data-active={false}
		>
			<SparkIcon class="size-5 group-hover:opacity-100 opacity-50" />
			<span> Generate </span>
		</a>
	</div>

	<div class="flex flex-row gap-2 items-center">
		{#if user}
			<UserAvatar {user} account={auth.account} />
		{:else if !$isLoginPage}
			<a
				href="/login"
				class="font-bold text-white bg-orange-500 hover:bg-orange-600 px-8 py-2 shadow-md rounded-lg md:flex flex-row gap-2 items-center hidden"
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

		<DropdownMenu.Root
			open={isMenuOpen}
			onOpenChange={(isOpen) => {
				isMenuOpen = isOpen;
			}}
		>
			<DropdownMenu.Trigger
				class="md:hidden focus-visible inline-flex h-10 w-10 items-center justify-center bg-background-alt text-sm font-medium text-foreground shadow-btn hover:bg-muted focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-98"
			>
				<MenuIcon
					class="size-10 text-neutral-500 rounded-full active:bg-gray-100 p-1 flex flex-row justify-center items-center"
				/>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-full max-w-[95vw] mx-auto rounded-xl border border-muted bg-background shadow-lg bg-white"
				sideOffset={8}
				transition={fly}
				transitionConfig={{
					duration: 200,
					x: 0,
					y: 20,
					opacity: 0.1,
					easing: linear
				}}
			>
				<DropdownMenu.Item
					class="flex flex-row gap-2 h-14 select-none items-center text-sm font-medium !ring-0 !ring-transparent active:bg-neutral-200"
				>
					<a
						href="/"
						class="flex flex-row gap-2 px-3"
						transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: 'x' }}
					>
						<SearchIcon class="size-5 group-hover:opacity-100 opacity-50" />
						<p>Explore</p>
					</a>
				</DropdownMenu.Item>
				<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
				<DropdownMenu.Item
					class="flex flex-row gap-2 h-14 select-none items-center text-sm font-medium !ring-0 !ring-transparent active:bg-neutral-200"
				>
					<a
						href="/"
						class="flex flex-row gap-2 px-3"
						transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: 'x' }}
					>
						<CookingIcon class="size-5 group-hover:opacity-100 opacity-50" />
						<p>My Recipes</p>
					</a>
				</DropdownMenu.Item>
				<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
				<DropdownMenu.Item
					class="flex flex-row gap-2 h-14 select-none items-center text-sm font-medium !ring-0 !ring-transparent active:bg-neutral-200"
				>
					<a
						href="/generate"
						class="flex flex-row gap-2 px-3"
						transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: 'x' }}
					>
						<SparkIcon class="size-5 group-hover:opacity-100 opacity-50" />
						<p>Generate</p>
					</a>
				</DropdownMenu.Item>

				<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
				<DropdownMenu.Item
					class="flex flex-row gap-2 h-12 select-none items-center text-sm font-medium !ring-0 !ring-transparent active:bg-neutral-200"
				>
					<a
						href="https://github.com/Neo-Ciber94/cocinaria"
						class="flex flex-row justify-center items-center gap-2 px-3 w-full"
						target="_blank"
					>
						<GithubAnimatedIcon class="size-4" />
						<p>View on Github</p>
					</a>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>
