<script lang="ts">
	import SushiIcon from '$components/icons/sushiIcon.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	const user = data.auth?.user;
</script>

<div class="w-full h-full flex flex-col justify-center items-center mx-auto md:max-w-3xl overflow-hidden">
	<section class="flex flex-row gap-4 items-center">
		<SushiIcon class="w-[300px] sm:w-[30%] max-w-[500px] aspect-square" />
		<h3 class="text-lg sm:text-3xl md:text-5xl font-bold">
			Turn Ingredients into Delicious Dishes!
		</h3>
	</section>
</div>
