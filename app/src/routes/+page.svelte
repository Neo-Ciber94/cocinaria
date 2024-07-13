<script lang="ts">
	import CookingIcon from '$components/icons/cookingIcon.svelte';
	import SushiIcon from '$components/icons/sushiIcon.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	const user = data.auth?.user;
</script>

<section
	class="w-full h-full flex flex-col justify-center items-center mx-auto md:max-w-3xl overflow-hidden"
>
	<div class="flex flex-col gap-2 justify-center p-4">
		<section class="flex flex-row gap-4 items-center">
			<SushiIcon class="w-[150px] md:w-[200px] lg:w-[30%] max-w-[500px] aspect-square bg-orange-100 p-4 sm:p-8 rounded-full" />
			<div class="flex flex-col gap-1">
				<h2 class="text-orange-500 text-3xl sm:text-4xl md:text-5xl font-extrabold">CocinarIA</h2>
				<h3 class="text-base sm:text-xl md:text-3xl font-bold text-neutral-600">
					Turn Ingredients into Delicious Dishes!
				</h3>
			</div>
		</section>

		<a
			href="/login"
			class="mx-auto w-full max-w-[80vw] sm:max-w-[400px] font-bold text-white bg-orange-500 hover:bg-orange-600 py-2 px-8 shadow-md rounded-2xl flex flex-row gap-2 items-center justify-center"
		>
			<CookingIcon class="text-white size-5" />
			<span> Start Cooking </span>
		</a>
	</div>
</section>
