<script lang="ts">
	import CopyLabel from '$components/CopyLabel.svelte';
	import CoinIcon from '$components/icons/coinIcon.svelte';
	import DiamongIcon from '$components/icons/diamondIcon.svelte';
	import DiscordIcon from '$components/icons/discordIcon.svelte';
	import GithubIcon from '$components/icons/githubIcon.svelte';
	import GoogleIcon from '$components/icons/googleIcon.svelte';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';
	import { getStringInitials } from '$lib/utils/strings';
	import { flyAndScale } from '$lib/utils/transitions';
	import type { PageServerData } from './$types';
	import { Avatar, Tooltip } from 'bits-ui';

	export let data: PageServerData;

	const formatter = new Intl.DateTimeFormat(undefined, {
		year: 'numeric',
		month: 'long',
		day: '2-digit'
	});

	const authIcons = {
		google: GoogleIcon,
		github: GithubIcon,
		discord: DiscordIcon
	};

	const authIcon = authIcons[data.account.authProvider];
</script>

<SvelteSeo title={(baseTitle) => `${baseTitle} | ${data.user.username}`} />

<section
	class="container mx-auto flex h-[calc(100vh-var(--header-height)*2)] w-full flex-col items-center justify-center"
>
	<div
		class="flex max-w-[98vw] cursor-pointer flex-row items-center gap-6 rounded-lg border bg-background p-6 shadow-md sm:min-w-[400px] md:p-8"
	>
		<div class="flex flex-col items-center gap-1">
			<div class="relative">
				<span class="relative flex h-20 w-20 shrink-0 overflow-hidden rounded-full md:h-24 md:w-24">
					<Avatar.Root
						class="h-full w-full rounded-full bg-neutral-400 text-[15px] font-medium uppercase text-neutral-300 sm:text-[25px]"
					>
						<div
							class="flex h-full w-full items-center justify-center overflow-hidden rounded-full"
						>
							<Avatar.Image src={data.user.picture} alt={data.user.username} />
							<Avatar.Fallback
								class="flex aspect-square h-full w-full flex-row items-center justify-center bg-orange-500 font-bold text-white"
							>
								{getStringInitials(data.user.username, 2).toUpperCase()}
							</Avatar.Fallback>
						</div>
					</Avatar.Root>
				</span>
				<div
					class="absolute -bottom-1 -right-1 rounded-full border border-gray-200 bg-white p-1 shadow-md"
				>
					<svelte:component this={authIcon} size="1.2rem" />
				</div>
			</div>
			{#if data.account.isPremium}
				<div>
					<button
						class="flex flex-row gap-0.5 rounded-3xl bg-purple-600 px-2 py-1 text-xs text-white shadow-md"
					>
						<DiamongIcon class="size-4" />
						<span> Premium </span>
					</button>
				</div>
			{/if}
		</div>

		<div class="grid gap-2">
			<div class="mt-1">
				<CopyLabel copy={data.user.id} text={data.user.id} class="max-w-[220px] xs:max-w-full" />
			</div>

			<div class="flex flex-row items-center gap-1 text-xl font-semibold">
				<span>
					{data.user.username}
				</span>
			</div>
			<div class="flex items-center gap-1 text-xs text-neutral-700">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-4"
				>
					<path d="M8 2v4"></path>
					<path d="M16 2v4"></path>
					<rect width="18" height="18" x="3" y="4" rx="2"></rect>
					<path d="M3 10h18"></path>
					<path d="M8 14h.01"></path>
					<path d="M12 14h.01"></path>
					<path d="M16 14h.01"></path>
					<path d="M8 18h.01"></path>
					<path d="M12 18h.01"></path>
					<path d="M16 18h.01"></path>
				</svg>
				<span>Joined {formatter.format(data.user.createdAt)}</span>
			</div>

			<Tooltip.Root openDelay={1000}>
				<Tooltip.Trigger>
					<div class="flex flex-row items-center gap-1 text-xs font-medium text-neutral-700">
						<CoinIcon class="size-4 text-neutral-500" />
						<span> Credits: </span>
						<span>
							{data.account.credits}
						</span>
					</div>
				</Tooltip.Trigger>
				<Tooltip.Content
					transition={flyAndScale}
					transitionConfig={{ y: 8, duration: 150 }}
					sideOffset={8}
					side="bottom"
				>
					<div class="bg-white">
						<Tooltip.Arrow class="border-dark-10 rounded-[2px] border-l border-t" />
					</div>
					<div
						class="rounded-input border-dark-10 flex items-center justify-center border bg-white p-3 text-sm font-medium shadow-popover outline-none"
					>
						{#if data.account.credits > 0}
							<span>You can generate recipes</span>
						{:else}
							<button>
								You need more credits or become <strong class="text-amber-600">premium</strong>
							</button>
						{/if}
					</div>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</div>
</section>
