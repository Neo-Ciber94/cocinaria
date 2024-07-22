<script lang="ts">
	import { page } from '$app/stores';
	import toast from 'svelte-french-toast';
	import { AuthError } from '../api/auth/utils';
	import { goto } from '$app/navigation';
	import LoginForm from './LoginForm.svelte';
	import { cn } from '$lib/utils';
	import { useFoodIcon } from '$lib/hooks/useFoodIcon';
	import { spring } from 'svelte/motion';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';

	$effect(() => {
		const error = $page.url.searchParams.get('AuthError') as AuthError | undefined;
		const isAuthError = (() => {
			switch (error) {
				case AuthError.InvalidState:
				case AuthError.LoginError:
				case AuthError.CallbackError:
					return true;
				default:
					return false;
			}
		})();

		if (!error) {
			return;
		}

		const searchParams = new URLSearchParams($page.url.searchParams);
		searchParams.delete('AuthError');
		goto(`?${searchParams.toString()}`, { replaceState: true });

		if (isAuthError) {
			toast.error('Authentication failed');
		}
	});

	const icon = useFoodIcon();
	const iconRight = spring(-500, { damping: 0.4, stiffness: 0.1 });
	const iconBottom = spring(-500, { damping: 0.4, stiffness: 0.1 });

	setTimeout(() => {
		iconRight.set(0);
		iconBottom.set(0);
	}, 100);

	function handleIconClick() {
		iconRight.set(-300);
		iconBottom.set(-300);

		// Between 100ms and 1500ms
		const ms = Math.random() * 1400 + 100;

		setTimeout(() => {
			iconRight.set(0);
			iconBottom.set(0);
		}, ms);
	}
</script>

<SvelteSeo title={(baseTitle) => `${baseTitle} | Login`} />

<div
	class={cn(
		'container mx-auto flex min-h-[calc(var(--main-height)*0.9)] w-full flex-row items-center justify-center'
	)}
>
	<div>
		<LoginForm class="min-w-[95vw] bg-white sm:min-w-[400px]" />
	</div>
</div>

<button
	onclick={handleIconClick}
	style="--food-icon-right: {$iconRight}px; --food-icon-bottom: {$iconBottom}px"
	class="food-icon fixed bottom-[var(--food-icon-bottom)] right-[var(--food-icon-right)] translate-x-1/3 translate-y-1/3 select-none text-[min(40vh,500px)] leading-none"
>
	{icon}
</button>

<style>
	.food-icon {
		will-change: transform;
		-webkit-font-smoothing: antialiased;
	}
</style>
