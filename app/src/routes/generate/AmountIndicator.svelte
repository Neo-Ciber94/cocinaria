<script lang="ts">
	import { cn } from '$lib';

	type Props = { count: number; max: number; min: number };

	let { count, max, min }: Props = $props();

	const width = 1 / max;

	function getClass(idx: number) {
		if (idx >= count) {
			return null;
		}

		if (count === min) {
			return 'bg-gradient-to-b from-orange-400 to-orange-600 animated-background';
		}

		if (count > min) {
			return 'bg-gradient-to-b from-green-500 to-green-700 animated-background';
		}

		return 'bg-red-500';
	}
</script>

<div class="w-full flex flex-row gap-1">
	{#each Array(max) as _, idx}
		<div
			class={cn('h-8 border border-gray-200 -skew-x-[15deg] rounded-md', getClass(idx))}
			style={`width: ${width * 100}%`}
		></div>
	{/each}
</div>
