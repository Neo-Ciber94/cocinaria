<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Avatar, DropdownMenu } from 'bits-ui';
	import type { User } from 'lucia';

	export let user: User;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="focus-visible hover:opacity-90 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background-alt text-sm font-medium text-foreground shadow-btn hover:bg-muted focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-98"
	>
		<Avatar.Root
			class="rounded-full bg-muted text-[17px] font-medium uppercase text-muted-foreground border border-gray-400 w-full h-full"
		>
			<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
				<Avatar.Image src={user.picture} alt={user.username} />
				<Avatar.Fallback
					class="w-full h-full aspect-square flex flex-row justify-center items-center bg-orange-500 text-white font-bold"
				>
					{user.username.slice(0, 2).toUpperCase()}
				</Avatar.Fallback>
			</div>
		</Avatar.Root>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class="w-full max-w-[229px] rounded-xl border border-muted bg-background px-1 py-1.5 shadow-popover"
		sideOffset={8}
	>
		<DropdownMenu.Item
			class="flex h-10 select-none items-center rounded-button py-1 px-2 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-muted"
		>
			<a
				class="flex items-center hover:bg-neutral-200/60 w-full p-2 rounded-lg flex-row gap-2"
				href="/user/@me"
			>
				<Icon icon="solar:user-circle-linear" class="size-5 text-gray-500" />
				<span>{user.username}</span>
			</a>
		</DropdownMenu.Item>
		<DropdownMenu.Item
			class="flex h-10 select-none items-center rounded-button py-1 px-2 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-muted"
		>
			<a
				class="flex items-center hover:bg-neutral-200/60 w-full p-2 rounded-lg flex-row gap-2"
				href="/api/auth/logout"
			>
				<Icon icon="solar:logout-2-outline" class="size-5 text-gray-500" />
				<span>Logout</span>
			</a>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
