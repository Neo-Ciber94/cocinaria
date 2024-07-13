<script lang="ts">
	import CopyLabel from '$components/copyLabel.svelte';
	import DiscordIcon from '$components/icons/discordIcon.svelte';
	import GithubIcon from '$components/icons/githubIcon.svelte';
	import GoogleIcon from '$components/icons/googleIcon.svelte';
	import type { PageServerData } from './$types';
	import { Avatar } from 'bits-ui';

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

	const authIcon = authIcons[data.authProvider];
</script>

<section
	class="container mx-auto w-full h-[calc(100vh-var(--header-height)*2)] flex flex-col justify-center items-center"
>
	<div
		class="rounded-lg border shadow-md flex flex-row items-center gap-6 p-6 md:p-8 min-w-[95vw] sm:min-w-[400px] cursor-pointer"
	>
		<div class="relative">
			<span class="relative flex shrink-0 overflow-hidden rounded-full h-20 w-20 md:h-24 md:w-24">
				<Avatar.Root
					class="rounded-full bg-muted text-[15px] sm:text-[25px] font-medium uppercase text-muted-foreground w-full h-full"
				>
					<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
						<Avatar.Image src={data.user.picture} alt={data.user.username} />
						<Avatar.Fallback
							class="w-full h-full aspect-square flex flex-row justify-center items-center bg-orange-500 text-white font-bold"
						>
							{data.user.username.slice(0, 2).toUpperCase()}
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

		<div class="grid gap-1">
			<div class="text-xl font-semibold flex flex-row items-center gap-1">
				<span>
					{data.user.username}
				</span>
			</div>
			<div class="flex items-center gap-1 text-xs text-muted-foreground">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-4 w-4"
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

			<div class="mt-1">
				<CopyLabel copy={data.user.id} text={data.user.id} />
			</div>
		</div>
	</div>
</section>
