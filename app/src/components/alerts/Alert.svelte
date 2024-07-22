<script lang="ts">
	import * as AlertDialog from '$components/ui/alert-dialog';
	import { tick } from 'svelte';
	import { useAlertManager, type AlertProps } from './useAlertManager.svelte';

	let { id, title, description, actions, resolve }: AlertProps = $props();

	const alertManager = useAlertManager();

	let isOpen = $state(false);
	const cancelLabel = actions?.cancel?.label ?? 'Cancel';
	const confirmLabel = actions?.confirm?.label ?? 'Confirm';

	$effect.root(() => {
		tick().then(() => {
			isOpen = true;
		});
	});

	function onCancel() {
		resolve(false);
	}

	function onConfirm() {
		resolve(true);
	}
</script>

<AlertDialog.Root
	open={isOpen}
	onOpenChange={(open) => {
		isOpen = open;

		if (!open) {
			setTimeout(() => alertManager.remove(id), 500);
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
			<AlertDialog.Cancel onclick={onCancel}>{cancelLabel}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={onConfirm}>{confirmLabel}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
