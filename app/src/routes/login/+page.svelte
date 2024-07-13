<script lang="ts">
	import { page } from '$app/stores';
	import toast from 'svelte-french-toast';
	import { AuthError } from '../api/auth/utils';
	import { goto } from '$app/navigation';

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
</script>

<div>
	<h1 class="text-2xl font-bold">Login</h1>
	<a href="/api/auth/google/login">Login With Google</a>
</div>
