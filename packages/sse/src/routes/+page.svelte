<script lang="ts">
	import { consume } from '$lib';

	let value = $state(0);

	consume('/api/counter', {
		onClose() {
			console.log('❌ Closed');
		},
		onMessage(ev) {
			if (ev.event === 'increment') {
				const count = JSON.parse(ev.data);
				console.log({ count });
				value = count;
			}
		}
	});
</script>

<h1>Count {value}</h1>
