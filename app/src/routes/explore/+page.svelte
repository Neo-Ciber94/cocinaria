<script lang="ts">
	import SearchIcon from '$components/icons/searchIcon.svelte';
	import RecipeItem from '$components/RecipeItem.svelte';
	import SvelteSeo from '$components/seo/SvelteSeo.svelte';
	import { cn } from '$lib/index';
	import { Button, type Selected } from 'bits-ui';
	import type { PageData } from './$types';
	import IngredientSearchSelect from './IngredientSearchSelect.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { debounce } from '$lib/common/utils';
	import toast from 'svelte-french-toast';

	let { data }: { data: PageData } = $props();
	let recipes = $state<PageData['recipes']>([]);

	const hasRecipes = $derived(data.recipes.length > 0);

	function getInitialIngredients() {
		const values = $page.url.searchParams
			.getAll('ingredients')
			.filter(Boolean)
			.map((value) => ({ value, label: value }));

		return values.length > 0 ? values : undefined;
	}

	let search = $state($page.url.searchParams.get('search'));
	let ingredients = $state<Selected<string>[] | undefined>(getInitialIngredients());
	const isSearching = $derived.by(() => {
		return search || (ingredients ?? []).length > 0;
	});

	// We do this to trigger entry transitions
	$effect(() => {
		recipes = data.recipes;
	});

	$effect(() => {
		if (data.error) {
			toast.error(data.error);
		}
	});

	function handleReset() {
		search = '';
		ingredients = [];
		goto('?');
	}

	async function doSearch() {
		const searchParams = new URLSearchParams();

		if (search && search.trim().length > 0) {
			searchParams.set('search', search);
		}

		if (ingredients && ingredients.length > 0) {
			const values = JSON.stringify(ingredients.filter(Boolean).map((x) => x.value));
			searchParams.set('ingredients', values);
		}

		recipes = [];
		await goto(`?${searchParams}`, { replaceState: true, keepFocus: true, invalidateAll: true });
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
		class="w-full flex flex-row gap-1 mt-2"
		autocomplete="off"
		onreset={handleReset}
		onsubmit={(ev) => {
			ev.preventDefault();
			debouncedSearch();
		}}
	>
		<div class="flex flex-row w-full gap-1">
			<div class="relative w-full">
				<input
					bind:value={search}
					oninput={debouncedSearch}
					name="search"
					type="search"
					class="inline-flex h-10 w-full items-center pl-8 rounded-md border border-neutral-200 bg-white px-[11px] text-sm transition-colors placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white"
					placeholder="Search..."
				/>
				<SearchIcon class="absolute size-5 text-neutral-200 left-2 top-0 translate-y-1/2" />
			</div>
			<IngredientSearchSelect
				class="w-full"
				bind:selected={ingredients}
				onClose={debouncedSearch}
			/>
		</div>
		<div class="flex flex-row w-full basis-1/3 gap-1">
			<Button.Root
				class={'relative rounded-lg px-4 py-2 justify-center text-white w-full flex flex-row items-center gap-1 bg-orange-500 hover:bg-orange-600'}
			>
				Search
			</Button.Root>
			<Button.Root
				type="reset"
				class={'relative rounded-lg px-4 py-2 justify-center text-white w-full flex flex-row items-center gap-1 bg-neutral-800 hover:bg-neutral-900 cursor-pointer'}
			>
				Clear
			</Button.Root>
		</div>
	</form>

	{#if hasRecipes}
		<div
			class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 flex-wrap py-5 justify-center"
		>
			{#each recipes as recipe, index}
				<RecipeItem
					{recipe}
					{index}
					class={cn(index % 6 === 0 && 'col-span-1 row-span-1 md:col-span-2 md:row-span-2')}
				/>
			{/each}
		</div>
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
