<script lang="ts">
	import Alert from './Alert.svelte';
	import { useAlertManager } from './alertManager.svelte';

	const alertManager = useAlertManager();
	$inspect(alertManager.alerts).with(console.log)
</script>

{#each alertManager.alerts as alertProps (alertProps.id)}
	<Alert {...alertProps} />
{/each}
