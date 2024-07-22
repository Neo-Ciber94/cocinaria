<script lang="ts">
	import * as AlertDialog from '$components/ui/alert-dialog';
	import { tick } from 'svelte';
	import { useAlertManager, type AlertProps } from './alertManager.svelte';

	let { id, title, description, actions }: AlertProps = $props();

	const alerts = useAlertManager();

	let isOpen = $state(false);
	const cancelLabel = actions?.cancel?.label ?? 'Cancel';
	const confirmLabel = actions?.confirm?.label ?? 'Confirm';

	$effect.root(() => {
		tick().then(() => {
			isOpen = true;
		});
	});
</script>

<AlertDialog.Root
	open={isOpen}
	onOpenChange={(open) => {
		isOpen = open;

		if (!open) {
			setTimeout(() => {
				alerts.removeAlert(id);
			}, 1000);
		}
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			{#if description}
				<AlertDialog.Description>
					{description}
				</AlertDialog.Description>
			{/if}
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{cancelLabel}</AlertDialog.Cancel>
			<AlertDialog.Action>{confirmLabel}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
