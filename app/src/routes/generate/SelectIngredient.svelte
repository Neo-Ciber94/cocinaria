<script lang="ts">
	import Check from 'svelte-radix/Check.svelte';
	import CaretSort from 'svelte-radix/CaretSort.svelte';
	import { tick } from 'svelte';
	import * as Command from '$components/ui/command/index.js';
	import * as Popover from '$components/ui/popover/index.js';
	import { Button } from '$components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import type { Category, Ingredient } from '$lib/common/ingredients';
	import OrangeSliceIcon from '$components/icons/orangeSliceIcon.svelte';

	type Props = {
		class?: string;
		contentClass?: string;
		selected?: Ingredient;
		ingredients: Ingredient[];
		disabled?: boolean;
		onchange: (item: Ingredient | undefined) => void;
	};

	let { onchange, ingredients, disabled, selected = $bindable(), ...rest }: Props = $props();
	let open = $state(false);
	let value = $state(selected?.value || '');
	let touched = $state(false);

	const initialIngredients = $state<Ingredient[]>(ingredients);
	const filteredIngredients = $derived.by(() => {
		if (value && touched) {
			return initialIngredients.filter((ingredient) =>
				ingredient.value.includes(value.toLowerCase())
			);
		}

		return initialIngredients;
	});

	function findIngredient(name: string) {
		return filteredIngredients.find((x) => x.value === name);
	}

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	const ingredientGroups = Object.groupBy(ingredients, (e) => e.category);
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			class={cn('relative w-[200px] justify-between pl-12', rest.class)}
		>
			{#if selected}
				<div class="absolute start-3 top-1/2 size-6 -translate-y-1/2 text-lg">
					{selected.image}
				</div>
				<span class="capitalize">{selected.value}</span>
			{:else}
				<OrangeSliceIcon
					class="absolute start-3 top-1/2 size-6 -translate-y-1/2 text-neutral-500"
				/>
				<span class="text-muted-foreground">Select an ingredient</span>
			{/if}
			<CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="max-h-[500px] w-[90%] overflow-y-auto p-0 sm:w-[400px]">
		<Command.Root>
			<Command.Input placeholder="Select an ingredient" class="h-9" {disabled} />
			<Command.Empty>No ingredients</Command.Empty>
			{#each Object.keys(ingredientGroups) as group}
				{@const ingredients = ingredientGroups[group as Category] || []}
				{#if ingredients}
					<Command.Group heading={group}>
						<Command.List>
							{#each ingredients as ingredient}
								<Command.Item
									class="flex flex-row gap-2"
									value={ingredient.value}
									onSelect={(currentValue) => {
										const ingredient = findIngredient(currentValue);
										value = currentValue;
										onchange(ingredient);
										closeAndFocusTrigger(ids.trigger);
									}}
								>
									<Check
										class={cn('mr-2 h-4 w-4', value !== ingredient.value && 'text-transparent')}
									/>
									{ingredient.image}

									<span class="capitalize">
										{ingredient.value}
									</span>
								</Command.Item>
							{/each}
						</Command.List>
					</Command.Group>
				{/if}
			{/each}
		</Command.Root>
	</Popover.Content>
</Popover.Root>
