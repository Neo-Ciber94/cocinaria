<script lang="ts">
	import { page } from '$app/stores';
	import CookingIcon from '$components/icons/cookingIcon.svelte';
	import SearchIcon from '$components/icons/searchIcon.svelte';
	import CoinIcon from '$components/icons/coinIcon.svelte';
	import DiamondIcon from '$components/icons/diamondIcon.svelte';
	import KeyIcon from '$components/icons/keyIcon.svelte';
	import { useAuth } from '$lib/hooks/useAuth.svelte';
	import { useFoodIcon } from '$lib/hooks/useFoodIcon';
	import { derived } from 'svelte/store';
	import UserAvatar from './UserAvatar.svelte';
	import MenuIcon from '$components/icons/menuIcon.svelte';
	import { DropdownMenu } from 'bits-ui';
	import { linear } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { breakpoints, useMatchQuery } from '$lib/hooks/useMatchQuery.svelte';
	import SparkIcon from '$components/icons/sparkIcon.svelte';
	import GithubAnimatedIcon from '$components/icons/githubAnimatedIcon.svelte';
	import { useApiKeyDialog } from '$lib/hooks/useApiKeyDialog.svelte';
	import type { Component } from 'svelte';
	import { cn } from '$lib/utils';
	import LoginIcon from '$components/icons/loginIcon.svelte';

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
	const isDesktopQuery = useMatchQuery(breakpoints.desktop);
	const apiKeyDialogOpen = useApiKeyDialog();

	function isActive(pathname: string) {
		const currentPath = $page.url.pathname.split('/').filter(Boolean)[0];
		const otherPath = pathname.replace(/\//, '');
		return currentPath === otherPath;
	}

	$effect(() => {
		if (isDesktopQuery.matches) {
			isMenuOpen = false;
		}
	});

	let scrollY = $state(0);
</script>

<svelte:window bind:scrollY />

<header
	class={cn(
		'fixed z-10 flex h-[var(--header-height)] w-full flex-row items-center justify-between bg-background px-2 xs:static sm:px-4',
		scrollY > 100 && 'shadow-sm shadow-black/30 transition-shadow xs:shadow-none'
	)}
>
	<div class="flex flex-row items-center gap-4">
		<DropdownMenu.Root
			open={isMenuOpen}
			onOpenChange={(isOpen) => {
				isMenuOpen = isOpen;
			}}
		>
			<DropdownMenu.Trigger
				class="focus-visible active:scale-98 inline-flex h-10 w-10 items-center justify-center rounded-3xl text-sm font-medium text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
			>
				<MenuIcon
					class="flex size-10 flex-row items-center justify-center rounded-full p-1 text-neutral-400 active:bg-gray-100"
				/>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="mx-auto w-full max-w-[95vw] overflow-hidden rounded-xl border border-muted bg-background shadow-lg sm:max-w-[400px]"
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

				{#if account}
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
				{:else}
					<DropdownMenu.Item
						class={cn(
							'flex h-14 w-full select-none flex-row items-center gap-2 text-sm font-medium !ring-0 !ring-transparent active:bg-neutral-200'
						)}
					>
						<a
							href={'/login'}
							class="flex w-full flex-row gap-2 px-3"
							transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: 'x' }}
						>
							<LoginIcon class={cn('size-5 opacity-50 group-hover:opacity-100')} />
							<p>Login</p>
						</a>
					</DropdownMenu.Item>
				{/if}

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

		<a
			class="flex flex-row justify-center font-mono text-base font-bold text-orange-500 sm:text-2xl"
			href="/"
		>
			<span>Cocinar</span>
			<span class="text-emerald-500">IA</span>
			<span>{icon}</span>
		</a>
	</div>

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
					<DiamondIcon class="size-3 text-purple-500 xxs:size-5" />
					<span class="text-[12px] font-semibold text-purple-800 xxs:text-sm">Premium</span>
				</button>
			{:else}
				<button
					class="flex flex-row items-center gap-1 rounded-md bg-amber-100 px-2 py-1 shadow-inner shadow-amber-600/70"
				>
					<CoinIcon class="size-3 text-amber-500 xxs:size-5" />
					<span class="text-[12px] font-semibold text-amber-800 xxs:text-sm">{account.credits}</span
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
	</div>
</header>

<!-- We reserve space for the header when is fixed on the top -->
<div class="block h-[var(--header-height)] sm:hidden"></div>
