<script lang="ts">
	import { cn } from '$lib/utils';
	import GithubIcon from '$components/icons/githubIcon.svelte';
	import GoogleIcon from '$components/icons/googleIcon.svelte';
	import DiscordIcon from '$components/icons/discordIcon.svelte';

	let props: { class?: string } = $props();
</script>

<div
	class={cn(
		'flex max-w-md flex-col gap-2 rounded-lg border border-gray-300 p-4 shadow-md',
		props.class
	)}
>
	<div class="mb-2">
		<h3 class="text-xl font-bold">Login</h3>
		<span class="text-sm text-gray-500">To continue to CocinerIA</span>
	</div>

	<a
		href="/api/auth/google/login"
		class="flex flex-row items-center gap-2 rounded-md border border-gray-200 px-3 py-2 shadow-sm hover:bg-orange-100"
	>
		<GoogleIcon size={'1.5rem'} />
		<span> Continue with Google </span>
	</a>

	<a
		href="/api/auth/github/login"
		class="flex flex-row items-center gap-2 rounded-md border border-gray-200 px-3 py-2 shadow-sm hover:bg-orange-100"
	>
		<GithubIcon size={'1.5rem'} />
		<span> Continue with Github </span>
	</a>

	<a
		href="/api/auth/discord/login"
		class="flex flex-row items-center gap-2 rounded-md border border-gray-200 px-3 py-2 shadow-sm hover:bg-orange-100"
	>
		<DiscordIcon size={'1.5rem'} />
		<span> Continue with Discord </span>
	</a>
</div>
