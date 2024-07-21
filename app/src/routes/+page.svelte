<script lang="ts">
	import CookingIcon from '$components/icons/cookingIcon.svelte';
	import SushiIcon from '$components/icons/sushiIcon.svelte';
	import RecipeItem from '$components/RecipeItem.svelte';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';
	import { useAuth } from '$lib/hooks/useAuth';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();
	const auth = useAuth();
</script>

<SvelteSeo />

<section
	class="w-full min-h-[var(--main-height)] flex flex-col justify-center items-center mx-auto md:max-w-3xl overflow-hidden"
>
	<div class="flex flex-col gap-2 justify-center p-4">
		<section class="flex flex-row gap-4 items-center">
			<SushiIcon
				class="w-[150px] md:w-[200px] lg:w-[30%] max-w-[500px] aspect-square bg-orange-100 p-4 sm:p-8 rounded-full"
			/>
			<div class="flex flex-col gap-1">
				<h2 class="text-orange-500 text-3xl sm:text-4xl md:text-5xl font-extrabold">CocinarIA</h2>
				<h3 class="text-base sm:text-xl md:text-3xl font-bold text-neutral-600">
					Turn Ingredients into Delicious Dishes!
				</h3>
			</div>
		</section>

		<a
			href={auth ? '/generate' : '/login'}
			class="mx-auto w-full max-w-[80vw] sm:max-w-[400px] font-bold text-white bg-orange-500 hover:bg-orange-600 py-2 px-8 shadow-md rounded-2xl flex flex-row gap-2 items-center justify-center"
		>
			<CookingIcon class="text-white size-5" />
			<span> Start Cooking </span>
		</a>
	</div>
</section>

{#if data.recipes.length > 0}
	<section class="w-full flex flex-col gap-2 bg-orange-500 px-4 py-10">
		<h2 class="text-white text-2xl md:text-3xl lg:text-5xl font-bold mb-4">Latest Recipes</h2>

		<div
			class="gap-2 items-center grid grid-cols-1 min-[200px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
		>
			{#each data.recipes as recipe (recipe.id)}
				<RecipeItem
					{recipe}
					transition={false}
					imgProps={{ width: 400, height: 400 }}
					class="w-full h-full items-center"
				/>
			{/each}
		</div>
	</section>
{/if}
