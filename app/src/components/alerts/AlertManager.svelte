<script lang="ts">
	import Alert from './Alert.svelte';
	import { useAlertManager } from './useAlertManager.svelte';

	const alertManager = useAlertManager();
</script>

{#each alertManager.alerts as alertProps (alertProps.id)}
	<Alert {...alertProps} />
{/each}
