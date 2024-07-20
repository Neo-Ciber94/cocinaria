<script lang="ts">
	import { execute } from '$lib/task/index.js';

	let value = $state(0);
	let loading = $state(false);
	let result = $state(false);

	async function run(ev: SubmitEvent) {
		ev.preventDefault();

		loading = true;
		try {
			result = await execute<boolean>('/api/task', {
				body: JSON.stringify({ n: value })
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Internal Error';
			alert('Error: ' + message);
		} finally {
			loading = false;
		}
	}
</script>

<form onsubmit={run}>
	<input name="number" type="number" bind:value />
	<button>Check</button>
</form>

<h2>
	Is prime?

	{#if loading}
		<span>Loading...</span>
	{:else}
		{result}
	{/if}
</h2>
