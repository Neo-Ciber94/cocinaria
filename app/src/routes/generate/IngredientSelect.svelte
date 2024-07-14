<script lang="ts">
	import { Combobox, type Selected } from 'bits-ui';
	import { flyAndScale } from '$lib/utils/transitions';
	import Icon from '@iconify/svelte';
	import { type Ingredient } from './ingredients';
	import { cn } from '$lib';

	let inputValue = $state('');
	let touchedInput = $state(false);

	type Props = {
		class?: string;
		inputClass?: string;
		contentClass?: string;
		selectedIngredient?: Ingredient;
		ingredients: Ingredient[];
		onchange: (item: Ingredient | undefined) => void;
	};

	let { onchange, ingredients, selectedIngredient = $bindable(), ...rest }: Props = $props();

	const initialIngredients = $state<Ingredient[]>(ingredients);
	const filteredIngredients = $derived.by(() => {
		if (inputValue && touchedInput) {
			return initialIngredients.filter((ingredient) =>
				ingredient.value.includes(inputValue.toLowerCase())
			);
		}

		return initialIngredients;
	});

	function handleChange(selected: Selected<string> | undefined) {
		if (selected) {
			const ingredient = filteredIngredients.find((x) => x.value === selected.value);
			selectedIngredient = ingredient;
			onchange(ingredient);
		} else {
			selectedIngredient = undefined;
			onchange(undefined);
		}
	}

	const selectedItem = $derived.by(() => {
		if (!selectedIngredient) {
			return undefined;
		}

		return { label: selectedIngredient.value, value: selectedIngredient.value };
	});
</script>

<Combobox.Root
	items={filteredIngredients}
	bind:inputValue
	bind:touchedInput
	selected={selectedItem}
	onSelectedChange={handleChange}
>
	<div class={cn('relative', rest.class)}>
		{#if selectedIngredient}
			<div class="absolute start-3 top-1/2 text-lg size-6 -translate-y-1/2">
				{selectedIngredient.image}
			</div>
		{:else}
			<Icon
				icon="ph:orange-slice"
				class="absolute start-3 top-1/2 size-6 -translate-y-1/2 text-neutral-500"
			/>
		{/if}

		<Combobox.Input
			class={cn(
				'inline-flex h-input w-full truncate rounded-lg border border-gray-200 bg-white px-11 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-white',
				rest.inputClass
			)}
			placeholder="Search an ingredient"
			aria-label="Search an ingredient"
		/>
		<Icon
			icon="heroicons:chevron-up-down-16-solid"
			class="absolute end-3 top-1/2 size-6 -translate-y-1/2"
		/>
	</div>

	<Combobox.Content
		class={cn(
			'w-full rounded-xl border border-neutral-300 bg-white px-1 py-3 shadow-sm outline-none max-h-[500px] overflow-y-auto',
			rest.contentClass
		)}
		transition={flyAndScale}
		sideOffset={8}
	>
		{#each filteredIngredients as ingredient (ingredient.value)}
			<Combobox.Item
				class="flex h-10 w-full select-none items-center rounded-md py-3 pl-5 pr-1.5 text-sm sm:text-lg outline-none transition-all gap-1 duration-75 data-[highlighted]:bg-neutral-200"
				value={ingredient.value}
				label={ingredient.value}
			>
				{ingredient.image}

				<span class="capitalize">
					{ingredient.value}
				</span>
				<Combobox.ItemIndicator class="ml-auto" asChild={false}>
					<Icon icon="material-symbols:check" />
				</Combobox.ItemIndicator>
			</Combobox.Item>
		{:else}
			<span class="block px-5 py-2 text-sm text-neutral-300"> No ingredient found </span>
		{/each}
	</Combobox.Content>
	<Combobox.HiddenInput name="ingredient" />
</Combobox.Root>
