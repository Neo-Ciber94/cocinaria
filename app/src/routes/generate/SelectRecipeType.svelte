<script lang="ts">
	import * as Select from '$components/ui/select/index.js';
	import type { RecipeType } from '$lib/common/recipe';
	import { useIsMounted } from '$lib/hooks/useIsMounted.svelte';
	import { cn } from '$lib/utils';
	import { flyAndScale } from '$lib/utils';
	import Icon from '@iconify/svelte';

	type Props = {
		selected?: RecipeType;
		touched?: boolean;
		class?: string;
		disabled?: boolean;
	};

	let { selected = $bindable(), touched = $bindable(), disabled, ...rest }: Props = $props();
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
	{disabled}
	selected={selectedRecipe}
	onSelectedChange={(item) => {
		const recipeItem = recipeTypes.find((e) => e.value === item?.value);
		selected = recipeItem?.value;
		touched = true;
	}}
>
	<Select.Trigger class={cn('w-[180px] data-[placeholder]:text-start', rest.class)}>
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
		<Select.Value placeholder="Select a recipe type" />
	</Select.Trigger>
	<Select.Content transition={flyAndScale} sideOffset={8}>
		<Select.Group>
			<Select.Label>Recipes</Select.Label>
			{#each recipeTypes as recipeType}
				{@const isSelected = selectedRecipe?.value === recipeType.value}

				<Select.Item value={recipeType.value} label={recipeType.label} class="flex flex-row gap-2">
					<Icon
						icon={recipeType.icon}
						class={cn('size-6 opacity-50', isSelected && 'opacity-90')}
					/>
					{recipeType.label}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
	<Select.Input name="recipeType" />
</Select.Root>
