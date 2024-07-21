<script lang="ts">
	import CopyLabel from '$components/CopyLabel.svelte';
	import CoinIcon from '$components/icons/coinIcon.svelte';
	import DiamongIcon from '$components/icons/diamondIcon.svelte';
	import DiscordIcon from '$components/icons/discordIcon.svelte';
	import GithubIcon from '$components/icons/githubIcon.svelte';
	import GoogleIcon from '$components/icons/googleIcon.svelte';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';
	import { getStringInitials } from '$lib/utils/getStringInitials';
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
	class="container mx-auto w-full h-[calc(100vh-var(--header-height)*2)] flex flex-col justify-center items-center"
>
	<div
		class="rounded-lg border shadow-md flex flex-row items-center gap-6 p-6 md:p-8 min-w-[95vw] sm:min-w-[400px] cursor-pointer"
	>
		<div class="flex flex-col gap-1 items-center">
			<div class="relative">
				<span class="relative flex shrink-0 overflow-hidden rounded-full h-20 w-20 md:h-24 md:w-24">
					<Avatar.Root
						class="rounded-full bg-neutral-400 text-[15px] sm:text-[25px] font-medium uppercase text-neutral-300 w-full h-full"
					>
						<div
							class="flex h-full w-full items-center justify-center overflow-hidden rounded-full"
						>
							<Avatar.Image src={data.user.picture} alt={data.user.username} />
							<Avatar.Fallback
								class="w-full h-full aspect-square flex flex-row justify-center items-center bg-orange-500 text-white font-bold"
							>
								{getStringInitials(data.user.username, 2).toUpperCase()}
							</Avatar.Fallback>
						</div>
					</Avatar.Root>
				</span>
				<div
					class="absolute -bottom-1 -right-1 p-1 bg-white shadow-md rounded-full border border-gray-200"
				>
					<svelte:component this={authIcon} size="1.2rem" />
				</div>
			</div>
			{#if data.account.isPremium}
				<div>
					<button
						class="px-2 py-1 rounded-3xl text-white bg-purple-600 shadow-md text-xs flex flex-row gap-0.5"
					>
						<DiamongIcon class="size-4" />
						<span> Premium </span>
					</button>
				</div>
			{/if}
		</div>

		<div class="grid gap-2">
			<div class="mt-1">
				<CopyLabel copy={data.user.id} text={data.user.id} />
			</div>

			<div class="text-xl font-semibold flex flex-row items-center gap-1">
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
					<div class="text-xs text-neutral-700 font-medium flex flex-row items-center gap-1">
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
						<Tooltip.Arrow class="rounded-[2px] border-l border-t border-dark-10" />
					</div>
					<div
						class="flex items-center justify-center rounded-input border border-dark-10 bg-white p-3 text-sm font-medium shadow-popover outline-none"
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
