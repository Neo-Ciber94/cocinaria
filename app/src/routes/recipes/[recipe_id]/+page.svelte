<script lang="ts">
	import { useAuth } from '$lib/hooks/useAuth';
	import type { PageData } from './$types';
	import RegenerateRecipeImageButton from './RegenerateRecipeImageButton.svelte';
	import { INGREDIENTS } from '$lib/common/ingredients';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';
	import DeleteRecipeButton from './DeleteRecipeButton.svelte';
	import { NOT_FOUND_IMAGE } from '$lib/common/constants';
	import GeneratedBy from '$components/GeneratedBy.svelte';

	let { data }: { data: PageData } = $props();

	const auth = useAuth();
	const isCurrentUserRecipe = $derived(auth?.user.id === data.recipe.userId);

	function getIngredientImages(recipeIngredients: string[]) {
		const images = INGREDIENTS.filter((ingredient) =>
			recipeIngredients.includes(ingredient.value)
		).map((ingredient) => ingredient.image);

		return images;
	}

	const recipe = $derived(data.recipe);
	let isDeleted = $state(false);
</script>

<SvelteSeo title={(baseTitle) => `${baseTitle} | ${recipe.name}`} />

<div class="w-full min-h-screen mx-auto container max-w-3xl md:max-w-5xl pt-4 sm:pt-12 md:pt-20">
	{#if isCurrentUserRecipe}
		<div class="w-full flex flex-row justify-end">
			<DeleteRecipeButton disabled={isDeleted} onDeleted={() => (isDeleted = true)} />
		</div>
	{/if}

	<div class="flex flex-col p-4 shadow-md border border-gray-200 rounded-lg bg-white">
		<section class="w-full pt-5 md:pt-12 lg:pt-16">
			<div class="container space-y-10 xl:space-y-16 px-4 md:px-6 mx-auto">
				<div class="grid gap-4 md:grid-cols-2 md:gap-16">
					<div class="flex flex-col">
						<h1
							class="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]"
						>
							{recipe.name}
						</h1>
						<p class="flex flex-row gap-0.5 w-full justify-start">
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
						/>
						{#if isCurrentUserRecipe}
							<div class="flex flex-row gap-2 w-full">
								<RegenerateRecipeImageButton disabled={isDeleted} class="w-full" />
							</div>
						{/if}
					</div>
				</div>
			</div>
		</section>
		<hr class="border-b my-8" />
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

		<div class="w-full justify-end flex flex-row mt-8">
			<GeneratedBy
				generatedAt={recipe.createdAt}
				ownerUsername={recipe.user.username}
				ownerPicture={recipe.user.picture}
			/>
		</div>
	</div>
</div>
