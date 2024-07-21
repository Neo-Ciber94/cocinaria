<script lang="ts">
	import CookingIcon from '$components/icons/cookingIcon.svelte';
	import SushiIcon from '$components/icons/sushiIcon.svelte';
	import RecipeItem from '$components/RecipeItem.svelte';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';
	import { useAuth } from '$lib/hooks/useAuth.svelte';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();
	const auth = useAuth();
</script>

<SvelteSeo />

<section
	class="mx-auto flex min-h-[var(--main-height)] w-full flex-col items-center justify-center overflow-hidden md:max-w-3xl"
>
	<div class="flex flex-col justify-center gap-2 p-4">
		<section class="flex flex-row items-center gap-4">
			<SushiIcon
				class="aspect-square w-[150px] max-w-[500px] rounded-full bg-orange-100 p-4 sm:p-8 md:w-[200px] lg:w-[30%]"
			/>
			<div class="flex flex-col gap-1">
				<h2 class="text-3xl font-extrabold text-orange-500 sm:text-4xl md:text-5xl">CocinarIA</h2>
				<h3 class="text-base font-bold text-neutral-600 sm:text-xl md:text-3xl">
					Turn Ingredients into Delicious Dishes!
				</h3>
			</div>
		</section>

		<a
			href={auth ? '/generate' : '/login'}
			class="mx-auto flex w-full max-w-[80vw] flex-row items-center justify-center gap-2 rounded-2xl bg-orange-500 px-8 py-2 font-bold text-white shadow-md hover:bg-orange-600 sm:max-w-[400px]"
		>
			<CookingIcon class="size-5 text-white" />
			<span> Start Cooking </span>
		</a>
	</div>
</section>

{#if data.recipes.length > 0}
	<section class="flex w-full flex-col gap-2 bg-orange-500 px-4 py-10">
		<h2 class="mb-4 text-2xl font-bold text-white md:text-3xl lg:text-5xl">Latest Recipes</h2>

		<div
			class="grid grid-cols-1 items-center gap-2 xxs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
		>
			{#each data.recipes as recipe (recipe.id)}
				<RecipeItem
					{recipe}
					transition={false}
					imgProps={{ width: 400, height: 400 }}
					class="h-full w-full items-center"
				/>
			{/each}
		</div>
	</section>
{/if}
