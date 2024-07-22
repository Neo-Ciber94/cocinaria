<script lang="ts">
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';

	type $$Props = AlertDialogPrimitive.PortalProps;
</script>

<AlertDialogPrimitive.Portal {...$$restProps}>
	<slot />
</AlertDialogPrimitive.Portal>
