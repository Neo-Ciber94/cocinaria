<script lang="ts">
	import { consume } from '$lib/index.js';
	import type { CounterEvents } from './api/stream/types.js';

	let value = $state(0);

	consume<CounterEvents>('/api/stream', {
		onClose() {
			console.log('❌ Closed');
		},
		onData(data) {
			if (data.eventName === 'increment') {
				value = data.value;
			}
		}
	});
</script>

<h1>Count {value}</h1>
