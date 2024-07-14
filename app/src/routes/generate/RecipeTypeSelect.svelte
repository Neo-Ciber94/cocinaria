<script lang="ts">
	import { Select } from 'bits-ui';
	import { flyAndScale } from '$lib/utils/transitions';
	import Icon from '@iconify/svelte';
	import type { RecipeType } from '$lib/common/recipe';
	import { cn } from '$lib';
	import { useIsMounted } from '$lib/hooks/useIsMounted.svelte';

	type Props = {
		selected?: RecipeType;
		class?: string;
		disabled?: boolean;
	};

	let { selected = $bindable(), disabled, ...rest }: Props = $props();
	const mounted = useIsMounted();

	const recipeTypes = [
		{ value: 'main', label: 'Main', icon: 'fxemoji:sliceofpizza' },
		{ value: 'dessert', label: 'Dessert', icon: 'fxemoji:shortcake' },
		{ value: 'snack', label: 'Snack', icon: 'emojione-v1:cookie' },
		{ value: 'drink', label: 'Drink', icon: 'fxemoji:hotbeverage' }
	] satisfies { value: RecipeType; label: string; icon: string }[];

	let selectedRecipe = $derived(recipeTypes.find((e) => e.value === selected));
</script>

<Select.Root
	items={recipeTypes}
	selected={selectedRecipe}
	{disabled}
	onSelectedChange={(item) => {
		const recipeItem = recipeTypes.find((e) => e.value === item?.value);
		selected = recipeItem?.value;
	}}
>
	<Select.Trigger
		{disabled}
		class={cn(
			'inline-flex h-10 w-[296px] items-center rounded-xl border border-gray-200 bg-white px-[11px] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2',
			'disabled:bg-gray-100 disabled:cursor-not-allowed',
			rest.class
		)}
		aria-label="Select a recipe type"
	>
		{#if mounted.value && selectedRecipe}
			<Icon icon={selectedRecipe.icon} class="mr-[9px] size-6" />
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-[9px] size-6 text-neutral-300"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M21.625 18.75L19.8 16.925L20.8 7h-9.55L11 5h5V1h2v4h5zm-1.15 4.55L.675 3.5L2.1 2.075l19.8 19.8zM1 19v-2h15v2zm1 4q-.425 0-.712-.288T1 22v-1h15v1q0 .425-.288.713T15 23zM9.05 9.025v2q-.125 0-.275-.013T8.5 11q-1.475 0-2.787.5T3.675 13h9.35l2 2H1q0-3.025 2.338-4.512T8.5 9q.125 0 .275.013t.275.012M8.5 13"
				/>
			</svg>
		{/if}

		<Select.Value class="text-sm" placeholder="Select a recipe type" />

		<Icon icon="heroicons:chevron-up-down-16-solid" class="ml-auto size-6 text-neutral-300" />
	</Select.Trigger>
	<Select.Content
		class="w-full rounded-xl border border-gray-200 bg-white px-1 py-3 shadow-md outline-none space-y-1"
		transition={flyAndScale}
		sideOffset={8}
	>
		{#each recipeTypes as recipeType}
			{@const isSelected = selectedRecipe?.value === recipeType.value}

			<Select.Item
				class={cn(
					'flex gap-2 h-10 w-full select-none items-center rounded-md py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-neutral-100',
					isSelected && 'bg-neutral-100'
				)}
				value={recipeType.value}
				label={recipeType.label}
			>
				<Icon icon={recipeType.icon} class={cn('size-6 opacity-50', isSelected && 'opacity-90')} />
				{recipeType.label}
				<Select.ItemIndicator class="ml-auto" asChild={false}>
					<Icon icon="material-symbols:check" />
				</Select.ItemIndicator>
			</Select.Item>
		{/each}
	</Select.Content>
	<Select.Input name="recipeType" />
</Select.Root>
