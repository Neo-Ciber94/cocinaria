<script lang="ts">
	import { page } from '$app/stores';
	import CookingIcon from '$components/icons/cookingIcon.svelte';
	import SearchIcon from '$components/icons/searchIcon.svelte';
	import CoinIcon from '$components/icons/coinIcon.svelte';
	import DiamondIcon from '$components/icons/diamondIcon.svelte';
	import KeyIcon from '$components/icons/keyIcon.svelte';
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
	import { useApiKeyDialog } from '$lib/hooks/useApiKeyDialog.svelte';
	import type { Component } from 'svelte';

	type MenuItem = { href: string; label: string; icon: Component };

	const MENU_ITEMS: MenuItem[] = [
		{
			href: '/explore',
			label: 'Explore',
			icon: SearchIcon
		},
		{
			href: '/my-recipes',
			label: 'My Recipes',
			icon: CookingIcon
		},
		{
			href: '/generate',
			label: 'Generate',
			icon: SparkIcon
		}
	];

	const isLoginPage = derived(
		page,
		($p) => $p.url.pathname.split('/').filter(Boolean)[0] === 'login'
	);

	const icon = useFoodIcon();
	const auth = useAuth();

	const user = auth?.user;
	const account = auth?.account;
	let isMenuOpen = $state(false);
	const isSmallScreenQuery = useMatchQuery('(max-width: 768px)');
	const apiKeyDialogOpen = useApiKeyDialog();

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
		{#each MENU_ITEMS as menuItem}
			<a
				href={menuItem.href}
				class="font-medium text-neutral-600 group min-w-[90px] text-center p-2 rounded-md hover:bg-orange-500 hover:text-white flex flex-row items-center gap-1"
				data-active={false}
			>
				<svelte:component this={menuItem.icon} class="size-5 group-hover:opacity-100 opacity-50" />
				<span> {menuItem.label} </span>
			</a>
		{/each}
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
				class="w-full max-w-[95vw] mx-auto rounded-xl border border-muted bg-background shadow-lg"
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
				{#each MENU_ITEMS as menuItem}
					<DropdownMenu.Item
						class="flex flex-row gap-2 h-14 select-none items-center text-sm font-medium !ring-0 !ring-transparent active:bg-neutral-200 w-full"
					>
						<a
							href={menuItem.href}
							class="flex flex-row gap-2 px-3 w-full"
							transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: 'x' }}
						>
							<svelte:component
								this={menuItem.icon}
								class="size-5 group-hover:opacity-100 opacity-50"
							/>
							<p>{menuItem.label}</p>
						</a>
					</DropdownMenu.Item>

					<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
				{/each}

				<DropdownMenu.Item
					class="flex h-14 select-none items-center rounded-md py-1 px-2 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-gray-200"
				>
					<button
						class="flex items-center w-full p-2 rounded-lg flex-row gap-2"
						onclick={() => {
							apiKeyDialogOpen.isOpen = true;
						}}
					>
						<KeyIcon class="size-5 text-gray-500" />
						<span>API Key</span>
					</button>
				</DropdownMenu.Item>

				{#if account && account.isPremium}
					<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
					<DropdownMenu.Item
						class="flex h-14 select-none items-center rounded-md py-1 px-2 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-purple-300 group hover:text-white cursor-pointer"
					>
						<div class="flex items-center w-full p-2 rounded-lg flex-row gap-2">
							<DiamondIcon class="size-5 group-hover:scale-110 transition-transform" />
							<span> Premium </span>
						</div>
					</DropdownMenu.Item>
					<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
					<DropdownMenu.Item
						class="flex h-14 select-none items-center rounded-md py-1 px-2 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-amber-200 group"
					>
						<button
							class="flex items-center w-full p-2 rounded-lg flex-row gap-2 cursor-pointer"
							onclick={() => {
								if (account.credits <= 0) {
									alert('Sorry, there is no way to become premium, use an API key instead');
								}
							}}
						>
							<CoinIcon
								class="size-5 text-gray-500 group-hover:text-amber-500 group-hover:scale-110 transition-transform"
							/>
							<p class="flex flex-row gap-0.5 items-center">
								<span>Credits:</span>
								<span>{account.credits}</span>
							</p>
						</button>
					</DropdownMenu.Item>
				{/if}

				<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />

				<DropdownMenu.Item
					class="flex flex-row gap-2 h-12 select-none items-center text-sm font-medium !ring-0 !ring-transparent active:bg-neutral-200 w-full"
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
