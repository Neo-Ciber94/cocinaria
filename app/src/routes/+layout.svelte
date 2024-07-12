<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';
	import { Avatar, DropdownMenu } from 'bits-ui';

	export let data: LayoutData;
</script>

<header
	class="flex flex-row p-4 items-center justify-between w-full min-h-16 shadow-lg border-b border-gray-200"
>
	<h1 class="text-2xl font-bold">
		<span> Cociner </span>
		<span> IA </span>
	</h1>

	{#if data.user}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="focus-visible inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-input bg-background-alt text-sm font-medium text-foreground shadow-btn hover:bg-muted focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-98"
			>
				<Avatar.Root
					class="h-12 w-12 rounded-full borderborder-transparent bg-muted text-[17px] font-medium uppercase text-muted-foreground "
				>
					<div
						class="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-transparent"
					>
						<Avatar.Image src={data.user.picture} alt={data.user.username} />
						<Avatar.Fallback class="border border-muted">
							{data.user.username.slice(0, 2).toUpperCase()}
						</Avatar.Fallback>
					</div>
				</Avatar.Root>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-full max-w-[229px] rounded-xl border border-muted bg-background px-1 py-1.5 shadow-popover"
				sideOffset={8}
			>
				<DropdownMenu.Item
					class="flex h-10 select-none items-center rounded-button py-3 pl-3 pr-1.5 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-muted"
				>
					<div class="flex items-center">Logout</div>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/if}
</header>

<main class="p-2">
	<slot />
</main>
