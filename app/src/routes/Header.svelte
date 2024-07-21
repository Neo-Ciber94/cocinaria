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
	import { cn } from '$lib/utils';

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

	function isActive(pathname: string) {
		const currentPath = $page.url.pathname.split('/').filter(Boolean)[0];
		const otherPath = pathname.replace(/\//, '');
		return currentPath === otherPath;
	}

	$effect(() => {
		if (!isSmallScreenQuery.matches) {
			isMenuOpen = false;
		}
	});
</script>

<header class="flex h-[var(--header-height)] w-full flex-row items-center justify-between px-4">
	<a
		class="xss:text-base flex flex-row justify-center font-mono text-2xl font-bold text-orange-500"
		href="/"
	>
		<span>Cocinar</span>
		<span class="text-emerald-500">IA</span>
		<span>{icon}</span>
	</a>

	<div class="hidden h-full flex-row items-center gap-4 md:flex">
		{#each MENU_ITEMS as menuItem}
			{@const active = isActive(menuItem.href)}

			<a
				href={menuItem.href}
				data-active={active}
				class={cn(
					'group flex min-w-[90px] flex-row items-center gap-1 rounded-md p-2 text-center font-medium text-neutral-600 hover:bg-orange-500 hover:text-white',
					'data-[active=true]:bg-orange-500 data-[active=true]:text-white'
				)}
			>
				<svelte:component
					this={menuItem.icon}
					class={cn('size-5 opacity-50 group-hover:opacity-100', active && 'opacity-100')}
				/>
				<span> {menuItem.label} </span>
			</a>
		{/each}
	</div>

	<div class="flex flex-row items-center gap-2">
		{#if user}
			{@const account = auth.account}

			{#if account.isPremium}
				<button
					class="flex flex-row items-center gap-1 rounded-md bg-purple-100 px-2 py-1 shadow-inner shadow-purple-600/70"
				>
					<DiamondIcon class="xxs:size-5 size-3 text-purple-500" />
					<span class="xxs:text-sm text-[12px] font-semibold text-purple-800">Premium</span>
				</button>
			{:else}
				<button
					class="flex flex-row items-center gap-1 rounded-md bg-amber-100 px-2 py-1 shadow-inner shadow-amber-600/70"
				>
					<CoinIcon class="xxs:size-5 size-3 text-amber-500" />
					<span class="xxs:text-sm text-[12px] font-semibold text-amber-800">{account.credits}</span
					>
				</button>
			{/if}

			<UserAvatar {user} {account} />
		{:else if !$isLoginPage}
			<a
				href="/login"
				class="hidden flex-row items-center gap-2 rounded-lg bg-orange-500 px-8 py-2 font-bold text-white shadow-md hover:bg-orange-600 md:flex"
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
				class="focus-visible bg-background-alt shadow-btn active:scale-98 text-foreground hover:bg-muted focus-visible:ring-foreground focus-visible:ring-offset-background inline-flex h-10 w-10 items-center justify-center text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 md:hidden"
			>
				<MenuIcon
					class="flex size-10 flex-row items-center justify-center rounded-full p-1 text-neutral-500 active:bg-gray-100"
				/>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="border-muted bg-background mx-auto w-full max-w-[95vw] overflow-hidden rounded-xl border shadow-lg"
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
					{@const active = isActive(menuItem.href)}

					<DropdownMenu.Item
						class={cn(
							'flex h-14 w-full select-none flex-row items-center gap-2 text-sm font-medium !ring-0 !ring-transparent active:bg-neutral-200',
							active && 'bg-orange-500 text-white'
						)}
					>
						<a
							href={menuItem.href}
							class="flex w-full flex-row gap-2 px-3"
							transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: 'x' }}
						>
							<svelte:component
								this={menuItem.icon}
								class={cn('size-5 opacity-50 group-hover:opacity-100', active && 'opacity-100')}
							/>
							<p>{menuItem.label}</p>
						</a>
					</DropdownMenu.Item>

					<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
				{/each}

				<DropdownMenu.Item
					class="flex h-14 select-none items-center rounded-md px-2 py-1 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-gray-200"
				>
					<button
						class="flex w-full flex-row items-center gap-2 rounded-lg p-2"
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
						class="group flex h-14 cursor-pointer select-none items-center rounded-md px-2 py-1 text-sm font-medium !ring-0 !ring-transparent hover:text-white data-[highlighted]:bg-purple-300"
					>
						<div class="flex w-full flex-row items-center gap-2 rounded-lg p-2">
							<DiamondIcon class="size-5 transition-transform group-hover:scale-110" />
							<span> Premium </span>
						</div>
					</DropdownMenu.Item>
					<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
					<DropdownMenu.Item
						class="group flex h-14 select-none items-center rounded-md px-2 py-1 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-amber-200"
					>
						<button
							class="flex w-full cursor-pointer flex-row items-center gap-2 rounded-lg p-2"
							onclick={() => {
								if (account.credits <= 0) {
									alert('Sorry, there is no way to become premium, use an API key instead');
								}
							}}
						>
							<CoinIcon
								class="size-5 text-gray-500 transition-transform group-hover:scale-110 group-hover:text-amber-500"
							/>
							<p class="flex flex-row items-center gap-0.5">
								<span>Credits:</span>
								<span>{account.credits}</span>
							</p>
						</button>
					</DropdownMenu.Item>
				{/if}

				<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />

				<DropdownMenu.Item
					class="flex h-12 w-full select-none flex-row items-center gap-2 text-sm font-medium !ring-0 !ring-transparent active:bg-neutral-200"
				>
					<a
						href="https://github.com/Neo-Ciber94/cocinaria"
						class="flex w-full flex-row items-center justify-center gap-2 px-3"
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
