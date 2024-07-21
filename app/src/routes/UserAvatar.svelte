<script lang="ts">
	import { flyAndScale } from '$lib/utils/transitions';
	import Icon from '@iconify/svelte';
	import { Avatar, DropdownMenu } from 'bits-ui';
	import type { User } from 'lucia';
	import type { Account } from '$lib/db/types';
	import CoinIcon from '$components/icons/coinIcon.svelte';
	import DiamongIcon from '$components/icons/diamondIcon.svelte';
	import KeyIcon from '$components/icons/keyIcon.svelte';
	import { useApiKeyDialog } from '$lib/hooks/useApiKeyDialog.svelte';
	import { getStringInitials } from '$lib/utils/getStringInitials';

	let { user, account }: { user: User; account: Account } = $props();
	const apiKeyDialogOpen = useApiKeyDialog();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="focus-visible hover:opacity-90 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background-alt text-sm font-medium text-foreground shadow-btn hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-98"
	>
		<Avatar.Root
			class="rounded-full bg-gray-200 text-[17px] font-medium uppercase text-gray-200 border border-gray-400 w-full h-full"
		>
			<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
				<Avatar.Image src={user.picture} alt={user.username} />
				<Avatar.Fallback
					class="w-full h-full aspect-square flex flex-row justify-center items-center bg-orange-500 text-white font-bold"
				>
					{getStringInitials(user.username, 2).toUpperCase()}
				</Avatar.Fallback>
			</div>
		</Avatar.Root>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class="w-full max-w-[229px] space-y-1 rounded-xl border border-gray-200 px-1 py-1.5 shadow-sm bg-white"
		sideOffset={8}
		transition={flyAndScale}
	>
		<DropdownMenu.Item
			class="flex h-10 select-none items-center rounded-md py-1 px-2 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-gray-200"
		>
			<a class="flex items-center w-full p-2 rounded-lg flex-row gap-2" href="/user/@me">
				<Icon icon="solar:user-circle-linear" class="size-5 text-gray-500" />
				<span>{user.username}</span>
			</a>
		</DropdownMenu.Item>

		<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
		<DropdownMenu.Item
			class="flex h-10 select-none items-center rounded-md py-1 px-2 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-gray-200"
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

		{#if account.isPremium}
			<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
			<DropdownMenu.Item
				class="flex h-10 select-none items-center rounded-md py-1 px-2 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-purple-300 group hover:text-white cursor-pointer"
			>
				<div class="flex items-center w-full p-2 rounded-lg flex-row gap-2">
					<DiamongIcon class="size-5 group-hover:scale-110 transition-transform" />
					<span> Premium </span>
				</div>
			</DropdownMenu.Item>
		{/if}

		<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
		<DropdownMenu.Item
			class="flex h-10 select-none items-center rounded-md py-1 px-2 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-amber-200 group"
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

		<DropdownMenu.Separator class="block h-px bg-neutral-500/10" />
		<DropdownMenu.Item
			class="flex h-10 select-none items-center rounded-md py-1 px-2 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-gray-200"
		>
			<a class="flex items-center w-full p-2 rounded-lg flex-row gap-2" href="/api/auth/logout">
				<Icon icon="solar:logout-2-outline" class="size-5 text-gray-500" />
				<span>Logout</span>
			</a>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
