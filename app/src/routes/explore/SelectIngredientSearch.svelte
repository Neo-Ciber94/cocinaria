<script lang="ts">
	import { type Selected } from 'bits-ui';
	import * as Select from '$components/ui/select/index.js';
	import { INGREDIENTS, type Category } from '$lib/common/ingredients';
	import { cn } from '$lib/utils';
	import OrangeSlice from '$components/icons/orangeSliceIcon.svelte';
	import { useMatchQuery, breakpoints } from '$lib/hooks/useMatchQuery.svelte';
	import * as Drawer from '$components/drawer';

	type Props = {
		class?: string;
		selected?: Selected<string>[];
		onClose?: () => void;
	};

	let { selected = $bindable(), onClose, ...rest }: Props = $props();
	const initialIngredients = INGREDIENTS.map((x) => ({ label: x.value, ...x }));
	const ingredientGroups = Object.groupBy(initialIngredients, (e) => e.category);

	const isDesktopQuery = useMatchQuery(breakpoints.desktop);
	let open = $state(false);
</script>

{#snippet Items()}
	{#each Object.keys(ingredientGroups) as group}
		{@const ingredients = ingredientGroups[group as Category] || []}

		<Select.Group>
			<Select.Label class="capitalize">{group}</Select.Label>
			{#each ingredients as ingredient}
				<Select.Item
					value={ingredient.value}
					label={ingredient.label}
					class="flex flex-row gap-2 px-2 py-2 pr-4 text-base data-[selected]:bg-neutral-100"
				>
					<span>{ingredient.image}</span>
					<span>{ingredient.label}</span>
				</Select.Item>
			{/each}
		</Select.Group>
	{/each}
{/snippet}

<Select.Root
	bind:selected
	bind:open
	items={initialIngredients}
	multiple
	onOpenChange={(isOpen) => {
		if (!isOpen) {
			onClose?.();
		}
	}}
>
	<Select.Trigger class={cn('w-[180px]', rest.class)}>
		<OrangeSlice class="mr-[9px] size-6 text-neutral-300" />
		<Select.Value placeholder="Ingredients" />
	</Select.Trigger>
	{#if isDesktopQuery.matches}
		<Select.Content class="max-h-[500px] overflow-y-auto">
			{@render Items()}
		</Select.Content>
	{:else}
		<Drawer.Root>
			<Drawer.Content bind:open>
				<div class="max-h-[80vh] min-h-[80vh] overflow-y-auto">
					{@render Items()}
				</div>
			</Drawer.Content>
		</Drawer.Root>
	{/if}

	<Select.Input name="ingredients" />
</Select.Root>
