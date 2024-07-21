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
	import { debounce } from '$lib/common/utils';
	import toast from 'svelte-french-toast';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import { fetchServer } from '$lib/client/fetchServer';
	import type { GetRecipesResult } from '../api/recipes/types';
	import OnViewport from './OnViewport.svelte';
	import { Button } from '$components/ui/button';
	import Input from '$components/ui/input/input.svelte';

	function getInitialIngredients() {
		const values = $page.url.searchParams
			.getAll('ingredients')
			.filter(Boolean)
			.map((value) => ({ value, label: value }));

		return values.length > 0 ? values : undefined;
	}

	let search = $state($page.url.searchParams.get('search'));
	let ingredients = $state<Selected<string>[] | undefined>(getInitialIngredients());
	const isSearching = $derived(search || (ingredients ?? []).length > 0);

	const recipesSearchParms = $derived.by(() => {
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

	const query = createInfiniteQuery({
		queryKey: ['recipes', getSearch(), getIngredients()],
		queryFn: async ({ pageParam, signal }) => {
			const sp = new URLSearchParams(recipesSearchParms);

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
		await goto(`?${recipesSearchParms}`, {
			replaceState: true,
			keepFocus: true,
			invalidateAll: true
		});
		await $query.refetch();
	}

	const debouncedSearch = debounce(doSearch, 500);
</script>

<SvelteSeo title={(baseTitle) => `${baseTitle} | Explore`} />

<div class="p-4 container mx-auto w-full h-full max-w-4xl lg:max-w-6xl pt-10 sm:pt-20">
	<h1 class="flex flex-row gap-2 mx-auto text-2xl sm:text-4xl items-center text-orange-400">
		<SearchIcon class="size-8 sm:size-12" />
		<span>Explore</span>
	</h1>

	<form
		class="w-full flex sm:flex-row flex-col gap-1 mt-2"
		autocomplete="off"
		onreset={handleReset}
		onsubmit={(ev) => {
			ev.preventDefault();
			debouncedSearch();
		}}
	>
		<div class="flex sm:flex-row flex-col w-full gap-1">
			<div class="relative w-full">
				<Input
					bind:value={search}
					oninput={debouncedSearch}
					name="search"
					type="search"
					class="w-full pl-8 rounded-md"
					placeholder="Search..."
				/>
				<SearchIcon class="absolute size-5 text-neutral-200 left-2 top-0 translate-y-1/2" />
			</div>
			<SelectIngredientSearch
				class="w-full"
				bind:selected={ingredients}
				onClose={debouncedSearch}
			/>
		</div>
		<div class="flex flex-row w-full basis-1/3 gap-1 xs:mt-0 mt-5">
			<Button
				class={'relative rounded-lg justify-center text-white w-full flex flex-row items-center gap-1 bg-orange-500 hover:bg-orange-600'}
			>
				Search
			</Button>
			<Button
				type="reset"
				class={'relative rounded-lg justify-center text-white w-full flex flex-row items-center gap-1 bg-neutral-800 hover:bg-neutral-900 cursor-pointer'}
			>
				Clear
			</Button>
		</div>
	</form>

	{#if $query.isLoading || $query.data == null}
		<h2
			class="flex flex-row justify-center items-center text-orange-400 h-[50vh] select-none w-full"
		>
			<LoadingDotsIcon class="size-10 sm:size-20" />
		</h2>
	{:else if $query.data.pages && totalCount > 0}
		{@const pages = $query.data.pages}
		<div
			class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 flex-wrap py-5 justify-center"
		>
			{#each pages as page}
				{@const recipes = page.recipes}

				{#each recipes as recipe, index}
					<RecipeItem
						{recipe}
						{index}
						class={cn(index % 6 === 0 && 'col-span-1 row-span-1 md:col-span-2 md:row-span-2')}
					/>
				{/each}
			{/each}
		</div>

		{#if $query.isFetchingNextPage}
			<h2
				class="flex flex-row justify-center items-center text-orange-400 h-[10vh] select-none w-full"
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
					class="text-base md:text-2xl lg:text-3xl font-bold flex flex-row justify-center items-center text-orange-500/90 h-[10vh] select-none w-full"
				>
					No more recipes
				</h2>
			{/if}
		{/if}
	{:else if isSearching}
		<h2
			class="text-xl md:text-4xl lg:text-5xl font-bold flex flex-row justify-center items-center text-neutral-400/70 h-[50vh] select-none w-full"
		>
			No recipes found
		</h2>
	{:else}
		<h2
			class="text-xl md:text-4xl lg:text-5xl font-bold flex flex-row justify-center items-center text-neutral-400/70 h-[50vh] select-none w-full"
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
