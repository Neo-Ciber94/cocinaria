<script lang="ts">
	import { cn } from '$lib';
	import GithubIcon from '$components/icons/githubIcon.svelte';
	import GoogleIcon from '$components/icons/googleIcon.svelte';

	let props: { class?: string } = $props();
</script>

<div
	class={cn(
		'p-4 shadow-md rounded-lg border border-gray-300 max-w-md flex flex-col gap-2',
		props.class
	)}
>
	<div class="mb-2">
		<h3 class="font-bold text-xl">Login</h3>
		<span class="text-sm text-gray-500">To continue to CocinerIA</span>
	</div>

	<a
		href="/api/auth/google/login"
		class="flex flex-row gap-2 items-center shadow-sm px-3 py-2 hover:bg-orange-100 border border-gray-200 rounded-md"
	>
		<GoogleIcon size={'1.5rem'} />
		<span> Continue with Google </span>
	</a>

	<a
		href="/api/auth/github/login"
		class="flex flex-row gap-2 items-center shadow-sm px-3 py-2 hover:bg-orange-100 border border-gray-200 rounded-md"
	>
		<GithubIcon size={'1.5rem'} />
		<span> Continue with Github </span>
	</a>
</div>
