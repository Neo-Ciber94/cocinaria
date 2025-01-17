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
	import RecipeImage from '$components/RecipeImage.svelte';
	import ShareButton from './ShareButton.svelte';
	import { cn } from '$lib/utils';

	let { data }: { data: PageData } = $props();
	const { seo } = data;

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
		url: seo.recipeUrl ?? undefined,
		images: seo.imageUrl
			? [
					{
						url: seo.imageUrl,
						alt: recipe.name,
						width: seo.imageSize,
						height: seo.imageSize
					}
				]
			: []
	}}
	twitter={{
		title: recipe.name,
		card: 'summary_large_image',
		description: recipe.description ?? undefined,
		image: seo.imageUrl,
		imageAlt: recipe.name
	}}
/>

<div
	class="mx-auto mb-2 min-h-screen w-full max-w-3xl px-4 pt-4 sm:container sm:px-1 sm:pt-12 md:max-w-5xl md:pt-20"
>
	<div class="flex w-full flex-row justify-end gap-2">
		<ShareButton
			recipeId={data.recipe.id}
			class={cn('w-full min-w-0 sm:w-auto sm:min-w-40', {
				'w-auto min-w-40': !isCurrentUserRecipe
			})}
		/>
		{#if isCurrentUserRecipe}
			<DeleteRecipeButton
				class="w-full min-w-0 sm:w-auto sm:min-w-40"
				disabled={isDeleted}
				onDeleted={() => (isDeleted = true)}
			/>
		{/if}
	</div>

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
						<RecipeImage
							src={recipe.imageUrl ?? NOT_FOUND_IMAGE}
							width={600}
							height={600}
							alt={recipe.name}
							class="mx-auto aspect-square overflow-hidden rounded-xl object-cover"
							style={`view-transition-name: recipe-${recipe.id}`}
							onerror={handleImageError}
							loadingAnimation={false}
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
					<ul class="grid gap-2 text-muted-foreground">
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
					<ol class="grid gap-4 text-muted-foreground">
						{#each recipe.recipe.steps as step, idx}
							<li>
								<div class="flex items-start gap-2">
									<div
										class="mt-1 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
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
