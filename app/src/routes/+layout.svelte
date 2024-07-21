<script lang="ts">
	import '../app.css';
	import '$lib/polyfills';
	import type { LayoutData } from './$types';
	import { Toaster as FrenchToaster } from 'svelte-french-toast';
	import { Toaster } from 'svelte-sonner';
	import { setFoodIcon } from '$lib/hooks/useFoodIcon';
	import { setAuth } from '$lib/hooks/useAuth.svelte';
	import Header from './Header.svelte';
	import GithubAnimatedIcon from '$components/icons/githubAnimatedIcon.svelte';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';
	import { setSeoBaseTitle } from '$components/seo/context';
	import ApiKeyDialog from '$components/ApiKeyDialog.svelte';
	import { useAIProvider } from '$lib/hooks/useAIProvider.svelte';
	import { browser } from '$app/environment';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { onNavigate } from '$app/navigation';
	import type { Snippet } from 'svelte';

	type Props = {
		data: LayoutData;
		children: Snippet;
	};

	let { data, children }: Props = $props();
	const icon = data.icon;

	const aiProvider = useAIProvider();
	aiProvider.value = data.aiProvider;

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: 1,
				staleTime: 1000 * 60 * 5, // 5min
				enabled: browser
			}
		}
	});

	// FIXME: GSAP Flip transition is not compatible, better use that until we get better browser support?
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	$effect(() => {
		setAuth(data.auth);
	});

	setAuth(data.auth);
	setFoodIcon(data.icon);
	setSeoBaseTitle(`CocinarIA ${icon}`);
</script>

<SvelteSeo themeColor="#FB923C"/>

<svelte:head>
	<title>{`CocinarIA ${icon}`}</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Sofia+Sans:ital,wght@0,1..1000;1,1..1000&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<Header />
<QueryClientProvider client={queryClient}>
	<main class="min-h-[calc(100vh-var(--header-height)-var(--footer-height))] w-full">
		<!-- prettier-ignore -->
		{@render children()}
	</main>
</QueryClientProvider>

<footer
	class="mt-auto flex h-[var(--footer-height)] flex-row items-center justify-between border-t border-gray-300/50 px-2 text-black sm:px-4"
>
	<p class="flex flex-row items-center gap-1">
		<span class="text-lg"> &copy; </span>
		<span>Copyleft</span>
	</p>

	<a
		href="https://github.com/Neo-Ciber94/cocinaria"
		class="flex flex-row items-center justify-center gap-2 px-3"
		target="_blank"
	>
		<GithubAnimatedIcon class="size-4" />
		<p>View on Github</p>
	</a>
</footer>

<div
	class="fixed -bottom-20 -left-20 -z-10 aspect-square w-[80%] min-w-[100px] max-w-[300px] rounded-full ring-[50px] ring-orange-100 md:ring-[100px]"
></div>

<!-- <div
	class="fixed select-none pointer-events-none -z-10 top-0 left-0 pattern-cross pattern-orange-500 pattern-bg-white pattern-size-6 pattern-opacity-20 w-full h-full"
></div> -->

<FrenchToaster toastOptions={{ duration: 6000 }} />
<Toaster toastOptions={{ duration: 6000 }} richColors />
<ApiKeyDialog />
