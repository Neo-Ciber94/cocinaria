<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { Dialog as DialogPrimitive } from 'bits-ui';

	type $$Props = DialogPrimitive.PortalProps;
</script>

<DialogPrimitive.Portal {...$$restProps}>
	<slot />
</DialogPrimitive.Portal>
