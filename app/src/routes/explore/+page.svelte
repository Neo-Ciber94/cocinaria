<script lang="ts">
	import SearchIcon from '$components/icons/searchIcon.svelte';
	import RecipeItem from '$components/RecipeItem.svelte';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';
	import LoadingDotsIcon from '$components/icons/loadingDotsIcon.svelte';
	import { cn } from '$lib/utils';
	import { type Selected } from 'bits-ui';
	import SelectIngredientSearch from './SelectIngredientSearch.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import toast from 'svelte-french-toast';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import { fetchServer } from '$lib/client/fetchServer';
	import type { GetRecipesResult } from '../api/recipes/types';
	import OnViewport from './OnViewport.svelte';
	import { Button } from '$components/ui/button';
	import Input from '$components/ui/input/input.svelte';
	import { debounce } from '$lib/utils/debounce';

	function getInitialIngredients() {
		try {
			const raw = $page.url.searchParams.get('ingredients');

			if (!raw) {
				return undefined;
			}

			const array = JSON.parse(raw);

			if (Array.isArray(array)) {
				return array
					.map((s) => s.trim())
					.filter(Boolean)
					.map((value) => ({ value, label: value }));
			}

			return undefined;
		} catch {
			return undefined;
		}
	}

	let search = $state($page.url.searchParams.get('search'));
	let ingredients = $state<Selected<string>[] | undefined>(getInitialIngredients());
	const isSearching = $derived(search || (ingredients ?? []).length > 0);

	const recipesSearchParams = $derived.by(() => {
		const ret = new URLSearchParams();

		if (search && search.trim().length > 0) {
			ret.set('search', search);
		}

		if (ingredients && ingredients.length > 0) {
			const values = JSON.stringify(ingredients.filter(Boolean).map((x) => x.value));
			ret.set('ingredients', values);
		}

		return ret;
	});

	const getSearch = () => search;
	const getIngredients = () => ingredients;

	$inspect(ingredients).with(console.log);

	const query = createInfiniteQuery({
		queryKey: ['recipes', getSearch(), getIngredients()],
		queryFn: async ({ pageParam, signal }) => {
			const sp = new URLSearchParams(recipesSearchParams);

			if (pageParam) {
				sp.set('cursor', pageParam);
			}

			const result = await fetchServer<GetRecipesResult>(`/api/recipes?${sp}`, {
				signal
			});
			return result;
		},
		initialPageParam: null as string | null,
		getNextPageParam({ next }) {
			return next;
		}
	});

	const queryError = $query.error;
	const totalCount = $derived.by(() => {
		const pages = $query.data?.pages || [];
		return pages.flatMap((x) => x.recipes).length;
	});

	const MIN_COUNT = 10;
	const showNoMoreRecipes = $derived(totalCount > MIN_COUNT);

	$effect(() => {
		if (queryError) {
			toast.error(queryError.message);
		}
	});

	async function handleReset() {
		search = '';
		ingredients = [];
		await goto('?', { replaceState: true, invalidateAll: true });
		await $query.refetch();
	}

	async function doSearch() {
		await goto(`?${recipesSearchParams}`, {
			replaceState: true,
			keepFocus: true,
			invalidateAll: true
		});
		await $query.refetch();
	}

	const debouncedSearch = debounce(doSearch, 500);
</script>

<SvelteSeo title={(baseTitle) => `${baseTitle} | Explore`} />

<div class="container mx-auto h-full w-full max-w-4xl p-4 pt-10 sm:pt-20 lg:max-w-6xl">
	<h1 class="mx-auto flex flex-row items-center gap-2 text-2xl text-orange-400 sm:text-4xl">
		<SearchIcon class="size-8 sm:size-12" />
		<span>Explore</span>
	</h1>

	<form
		class="mt-2 flex w-full flex-col gap-1 sm:flex-row"
		autocomplete="off"
		onreset={handleReset}
		onsubmit={(ev) => {
			ev.preventDefault();
			debouncedSearch();
		}}
	>
		<div class="flex w-full flex-col gap-1 sm:flex-row">
			<div class="relative w-full">
				<Input
					bind:value={search}
					oninput={debouncedSearch}
					name="search"
					type="search"
					class="w-full rounded-md pl-8"
					placeholder="Search..."
				/>
				<SearchIcon class="absolute left-2 top-0 size-5 translate-y-1/2 text-neutral-200" />
			</div>
			<SelectIngredientSearch
				class="w-full"
				bind:selected={ingredients}
				onClose={debouncedSearch}
			/>
		</div>
		<div class="mt-5 flex w-full basis-1/3 flex-row gap-1 xs:mt-0">
			<Button
				class={'relative flex w-full flex-row items-center justify-center gap-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600'}
			>
				Search
			</Button>
			<Button
				type="reset"
				class={'relative flex w-full cursor-pointer flex-row items-center justify-center gap-1 rounded-lg bg-neutral-800 text-white hover:bg-neutral-900'}
			>
				Clear
			</Button>
		</div>
	</form>

	{#if $query.isLoading || $query.data == null}
		<h2
			class="flex h-[50vh] w-full select-none flex-row items-center justify-center text-orange-400"
		>
			<LoadingDotsIcon class="size-10 sm:size-20" />
		</h2>
	{:else if $query.data.pages && totalCount > 0}
		{@const pages = $query.data.pages}

		<div
			class="grid grid-cols-1 flex-wrap justify-center gap-4 py-5 xxs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
		>
			{#each pages as page (page.next)}
				{@const recipes = page.recipes}

				{#each recipes as recipe, index (recipe.id)}
					<RecipeItem
						{recipe}
						{index}
						imgProps={{ width: 800, height: 800 }}
						class={cn(index % 6 === 0 && 'col-span-1 row-span-1 md:col-span-2 md:row-span-2')}
					/>
				{/each}
			{/each}
		</div>

		{#if $query.isFetchingNextPage}
			<h2
				class="flex h-[10vh] w-full select-none flex-row items-center justify-center text-orange-400"
			>
				<LoadingDotsIcon class="size-10 sm:size-16" />
			</h2>
		{/if}

		{#if !$query.isFetching}
			{#if $query.hasNextPage}
				<OnViewport
					delayMs={1000}
					onVisible={(visible) => {
						if (visible) {
							$query.fetchNextPage();
						}
					}}
				/>
			{:else if showNoMoreRecipes}
				<h2
					class="flex h-[10vh] w-full select-none flex-row items-center justify-center text-base font-bold text-orange-500/90 md:text-2xl lg:text-3xl"
				>
					No more recipes
				</h2>
			{/if}
		{/if}
	{:else if isSearching}
		<h2
			class="flex h-[50vh] w-full select-none flex-row items-center justify-center text-xl font-bold text-neutral-400/70 md:text-4xl lg:text-5xl"
		>
			No recipes found
		</h2>
	{:else}
		<h2
			class="flex h-[50vh] w-full select-none flex-row items-center justify-center text-xl font-bold text-neutral-400/70 md:text-4xl lg:text-5xl"
		>
			No recipes
		</h2>
	{/if}
</div>

<style>
	:global(body) {
		overflow-y: scroll;
	}
</style>
