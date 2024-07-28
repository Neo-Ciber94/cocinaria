<script lang="ts">
	import { flyAndScale } from '$lib/utils/transitions';
	import Icon from '@iconify/svelte';
	import { Avatar, DropdownMenu } from 'bits-ui';
	import type { User } from 'lucia';
	import type { Account } from '$lib/db/types';
	import CoinIcon from '$components/icons/coinIcon.svelte';
	import DiamondIcon from '$components/icons/diamondIcon.svelte';
	import KeyIcon from '$components/icons/keyIcon.svelte';
	import { useApiKeyDialog } from '$lib/hooks/useApiKeyDialog.svelte';
	import { getStringInitials } from '$lib/utils/strings';

	let { user, account }: { user: User; account: Account } = $props();
	const apiKeyDialogOpen = useApiKeyDialog();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="focus-visible bg-background-alt shadow-btn active:scale-98 inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium text-foreground hover:bg-gray-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
	>
		<Avatar.Root
			class="h-full w-full rounded-full border border-gray-400 bg-gray-200 text-[17px] font-medium uppercase text-gray-200"
		>
			<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
				<Avatar.Image src={user.picture} alt={user.username} />
				<Avatar.Fallback
					class="flex aspect-square h-full w-full flex-row items-center justify-center bg-orange-500 font-bold text-white"
				>
					{getStringInitials(user.username, 2).toUpperCase()}
				</Avatar.Fallback>
			</div>
		</Avatar.Root>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class="w-full max-w-[95vw] space-y-1 rounded-xl border border-gray-200 bg-white px-1 py-1.5 shadow-sm xs:max-w-[229px]"
		sideOffset={8}
		transition={flyAndScale}
	>
		<DropdownMenu.Item
			class="flex h-10 select-none items-center rounded-md px-2 py-1 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-gray-200"
		>
			<a class="flex w-full flex-row items-center gap-2 rounded-lg p-2" href="/user/@me">
				<Icon icon="solar:user-circle-linear" class="size-5 text-gray-500" />
				<span>{user.username}</span>
			</a>
		</DropdownMenu.Item>

		<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
		<DropdownMenu.Item
			class="flex h-10 select-none items-center rounded-md px-2 py-1 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-gray-200"
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

		{#if account.isPremium}
			<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
			<DropdownMenu.Item
				class="group flex h-10 cursor-pointer select-none items-center rounded-md px-2 py-1 text-sm font-medium !ring-0 !ring-transparent hover:text-white data-[highlighted]:bg-purple-300"
			>
				<div class="flex w-full flex-row items-center gap-2 rounded-lg p-2">
					<DiamondIcon class="size-5 transition-transform group-hover:scale-110" />
					<span> Premium </span>
				</div>
			</DropdownMenu.Item>
		{/if}

		<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
		<DropdownMenu.Item
			class="group flex h-10 select-none items-center rounded-md px-2 py-1 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-amber-200"
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

		<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
		<DropdownMenu.Item
			class="flex h-10 select-none items-center rounded-md px-2 py-1 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-gray-200"
		>
			<a
				data-sveltekit-preload-data="false"
				class="flex w-full flex-row items-center gap-2 rounded-lg p-2"
				href="/api/auth/logout"
			>
				<Icon icon="solar:logout-2-outline" class="size-5 text-gray-500" />
				<span>Logout</span>
			</a>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
