<script lang="ts">
	import { page } from '$app/stores';
	import toast from 'svelte-french-toast';
	import { AuthError } from '../api/auth/utils';
	import { goto } from '$app/navigation';
	import LoginForm from './LoginForm.svelte';
	import { cn } from '$lib';
	import { useFoodIcon } from '$lib/hooks/useFoodIcon';

	$effect(() => {
		const error = $page.url.searchParams.get('AuthError') as AuthError | undefined;
		const isAuthError = (() => {
			switch (error) {
				case AuthError.InvalidState:
				case AuthError.CallbackError:
					return true;
				default:
					return false;
			}
		})();

		const searchParams = new URLSearchParams($page.url.searchParams);
		searchParams.delete('AuthError');
		goto(`?${searchParams.toString()}`, { replaceState: true });

		if (isAuthError) {
			toast.error('Authentication failed');
		}
	});

	const icon = useFoodIcon();
</script>

<div
	class={cn(
		'container mx-auto flex flex-row w-full min-h-[calc(100vh-var(--header-height)*2)] justify-center items-center'
	)}
>
	<div>
		<LoginForm class="min-w-[95vw] sm:min-w-[400px] bg-white" />
	</div>
</div>

<div
	class="select-none pointer-events-none text-[min(50vh,500px)] fixed -right-0 -bottom-0 leading-none translate-x-1/3 translate-y-1/3"
>
	{icon}
</div>
