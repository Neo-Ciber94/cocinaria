<script lang="ts">
	import { useAuth } from '$lib/hooks/useAuth.svelte';
	import type { PageData } from './$types';
	import RegenerateRecipeImageButton from './RegenerateRecipeImageButton.svelte';
	import { INGREDIENTS } from '$lib/common/ingredients';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';
	import DeleteRecipeButton from './DeleteRecipeButton.svelte';
	import { NOT_FOUND_IMAGE } from '$lib/common/constants';
	import { relativeTime } from '$lib/hooks/relativeTime.svelte';
	import { handleImageError } from '$lib/client/handleImageError';
	import { useFoodIcon } from '$lib/hooks/useFoodIcon';

	let { data }: { data: PageData } = $props();

	const auth = useAuth();
	const isCurrentUserRecipe = $derived(auth?.user.id === data.recipe.userId);

	function getIngredientImages(recipeIngredients: string[]) {
		const images = INGREDIENTS.filter((ingredient) =>
			recipeIngredients.includes(ingredient.value)
		).map((ingredient) => ingredient.image);

		return images;
	}

	const icon = useFoodIcon();
	const recipe = $derived(data.recipe);
	let isDeleted = $state(false);
	const generatedAt = relativeTime(data.recipe.createdAt);
</script>

<SvelteSeo
	title={(baseTitle) => `${baseTitle} | ${recipe.name}`}
	description={recipe.description ?? undefined}
	keywords="{['recipe', 'ai', ...recipe.ingredients].join(', ')},"
	openGraph={{
		type: 'website',
		site_name: `CocinarIA ${icon}`,
		title: recipe.name,
		description: recipe.description ?? undefined,
		url: data.seo.recipeUrl ?? undefined,
		images: recipe.imageUrl
			? [
					{
						url: recipe.imageUrl,
						secure_url: recipe.imageUrl,
						alt: recipe.name
					}
				]
			: []
	}}
	twitter={{
		title: recipe.name,
		card: 'summary_large_image',
		description: recipe.description ?? undefined,
		image: recipe.imageUrl ?? undefined,
		imageAlt: recipe.name
	}}
/>

<div
	class="mx-auto min-h-screen w-full max-w-3xl px-4 pt-4 sm:container sm:px-1 sm:pt-12 md:max-w-5xl md:pt-20 mb-2"
>
	{#if isCurrentUserRecipe}
		<div class="flex w-full flex-row justify-end">
			<DeleteRecipeButton disabled={isDeleted} onDeleted={() => (isDeleted = true)} />
		</div>
	{/if}

	<div class="flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-md">
		<section class="w-full pt-5 md:pt-12 lg:pt-16">
			<div class="container mx-auto space-y-10 px-4 md:px-6 xl:space-y-16">
				<div class="grid gap-4 md:grid-cols-2 md:gap-16">
					<div class="flex flex-col">
						<h1
							class="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]"
						>
							{recipe.name}
						</h1>
						<p class="flex w-full flex-row justify-start gap-0.5">
							{#each getIngredientImages(recipe.ingredients) as ingredientImage}
								<span class="text-xl sm:text-2xl">{ingredientImage}</span>
							{/each}
						</p>

						{#if recipe.description}
							<p class="mt-2">{recipe.description}</p>
						{/if}
					</div>
					<div class="flex flex-col gap-1">
						<img
							src={recipe.imageUrl ?? NOT_FOUND_IMAGE}
							width="600"
							height="600"
							alt={recipe.name}
							class="mx-auto aspect-square overflow-hidden rounded-xl object-cover"
							style={`view-transition-name: recipe-${recipe.id}`}
							onerror={handleImageError}
						/>
						{#if isCurrentUserRecipe}
							<div class="flex w-full flex-row gap-2">
								<RegenerateRecipeImageButton disabled={isDeleted} class="w-full" />
							</div>
						{/if}
					</div>
				</div>
			</div>
		</section>
		<hr class="my-8 border-b" />
		<section class="w-full py-2 md:py-4 lg:py-6">
			<div class="container grid gap-12 px-4 md:px-6 lg:grid-cols-[1fr_2fr]">
				<div class="space-y-6">
					<h2 class="text-2xl font-bold">Ingredients</h2>
					<ul class="text-muted-foreground grid gap-2">
						{#each recipe.recipe.ingredients as ingredient}
							<li>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="mr-2 inline-block h-4 w-4"
								>
									<path d="M20 6 9 17l-5-5"></path>
								</svg>
								{ingredient}
							</li>
						{/each}
					</ul>
				</div>
				<div class="space-y-6">
					<h2 class="text-2xl font-bold">Instructions</h2>
					<ol class="text-muted-foreground grid gap-4">
						{#each recipe.recipe.steps as step, idx}
							<li>
								<div class="flex items-start gap-2">
									<div
										class="bg-primary text-primary-foreground mt-1 rounded-full px-2 py-1 text-xs font-medium"
									>
										{idx + 1}
									</div>
									<p>
										{step}
									</p>
								</div>
							</li>
						{/each}
					</ol>
				</div>
			</div>
		</section>

		<div class="mt-16 flex w-full flex-row justify-end">
			<time class="text-[13px] text-neutral-500" datetime={recipe.createdAt.toUTCString()}>
				<span>Generated</span>
				<span class="font-semibold">{generatedAt.value}</span>
			</time>
		</div>
	</div>
</div>
