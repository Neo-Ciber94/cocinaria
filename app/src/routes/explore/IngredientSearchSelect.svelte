<script lang="ts">
	import { Select, type Selected } from 'bits-ui';
	import { flyAndScale } from '$lib/utils/transitions';
	import { INGREDIENTS } from '$lib/common/ingredients';
	import Icon from '@iconify/svelte';
	import { cn } from '$lib/utils';
	import OrangeSlice from '$components/icons/orangeSliceIcon.svelte';

	type Props = {
		class?: string;
		selected?: Selected<string>[];
		onClose?: () => void;
	};

	let { selected = $bindable(), onClose, ...rest }: Props = $props();
	const ingredients = INGREDIENTS.map((x) => ({ value: x.value, label: x.value, image: x.image }));
</script>

<Select.Root
	bind:selected
	items={ingredients}
	multiple
	onOpenChange={(isOpen) => {
		if (!isOpen) {
			onClose?.();
		}
	}}
>
	<Select.Trigger
		class={cn(
			'inline-flex h-10 w-[296px] items-center rounded-md border border-neutral-200 bg-white px-[11px] text-sm transition-colors placeholder:text-black/50  focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white',
			rest.class
		)}
		aria-label="Ingredients"
	>
		<OrangeSlice class="mr-[9px] size-6 text-neutral-300" />
		<Select.Value class="text-sm data-[placeholder]:text-neutral-400" placeholder="Ingredients" />
		<Icon icon="heroicons:chevron-up-down-16-solid" class="ml-auto size-6 text-neutral-300" />
	</Select.Trigger>
	<Select.Content
		class="w-full max-h-[500px] overflow-y-auto rounded-xl border border-neutral-200 bg-white px-1 py-3 shadow-sm outline-none"
		transition={flyAndScale}
		sideOffset={8}
	>
		{#each ingredients as ingredient}
			<Select.Item
				class="flex gap-2 h-10 w-full select-none items-center rounded-sm py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-neutral-300 capitalize"
				value={ingredient.value}
				label={ingredient.label}
			>
				<span>{ingredient.image}</span>
				<span>{ingredient.label}</span>
				<Select.ItemIndicator class="ml-auto" asChild={false}>
					<Icon icon="material-symbols:check" />
				</Select.ItemIndicator>
			</Select.Item>
		{/each}
	</Select.Content>
	<Select.Input name="ingredients" />
</Select.Root>
