<script lang="ts" context="module">
	export type AIProviderSelectItem = { value: AIProvider; label: string; icon: any };

	// We only use openAI because we generate the images also using OpenAI, 
	// the recipes text could be generated with any provider
	const AI_PROVIDER_ITEMS = [
		{ value: 'openai', label: 'OpenAI', icon: OpenaiIcon }
		// { value: 'claude', label: 'Claude', icon: ClaudeaiIcon },
		// { value: 'gemini', label: 'Gemini', icon: GeminiAi }
	] satisfies AIProviderSelectItem[];
</script>

<script lang="ts">
	import { Select } from 'bits-ui';
	import { flyAndScale } from '$lib/utils/transitions';
	import Icon from '@iconify/svelte';
	import { cn } from '$lib';
	import { useIsMounted } from '$lib/hooks/useIsMounted.svelte';
	import type { AIProvider } from '$lib/common/types';
	import OpenaiIcon from './icons/openaiIcon.svelte';
	// import GeminiAi from './icons/geminiAiIcon.svelte';
	// import ClaudeaiIcon from './icons/claudeaiIcon.svelte';

	type Props = {
		selected: AIProviderSelectItem | undefined;
		class?: string;
		disabled?: boolean;
	};

	let { selected = $bindable(), disabled, ...rest }: Props = $props();
	const mounted = useIsMounted();

	const selectedProvider = $derived(AI_PROVIDER_ITEMS.find((e) => e.value === selected?.value));
</script>

<Select.Root items={AI_PROVIDER_ITEMS} bind:selected {disabled}>
	<Select.Trigger
		{disabled}
		class={cn(
			'inline-flex h-10 w-[296px] items-center rounded-xl border border-gray-200 bg-white px-[11px] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2',
			'disabled:bg-gray-100 disabled:cursor-not-allowed',
			rest.class
		)}
		aria-label="Select an AI provider"
	>
		{#if mounted.value && selectedProvider}
			<svelte:component this={selectedProvider.icon} class="mr-[9px] size-6" />
		{/if}

		<Select.Value class="text-sm data-[placeholder]:text-neutral-400" placeholder="Provider" />

		<Icon icon="heroicons:chevron-up-down-16-solid" class="ml-auto size-6" />
	</Select.Trigger>
	<Select.Content
		class="w-full rounded-xl border border-gray-200 bg-white px-1 py-3 shadow-md outline-none space-y-1"
		transition={flyAndScale}
		sideOffset={8}
	>
		{#each AI_PROVIDER_ITEMS as aiProvider}
			{@const isSelected = selected?.value === aiProvider.value}

			<Select.Item
				class={cn(
					'flex gap-2 h-10 w-full select-none items-center rounded-md py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-neutral-100 group',
					isSelected && 'bg-neutral-100'
				)}
				value={aiProvider.value}
				label={aiProvider.label}
			>
				<svelte:component
					this={aiProvider.icon}
					class={cn('size-6 opacity-50 group-hover:opacity-90', isSelected && 'opacity-90')}
				/>
				{aiProvider.label}
				<Select.ItemIndicator class="ml-auto" asChild={false}>
					<Icon icon="material-symbols:check" />
				</Select.ItemIndicator>
			</Select.Item>
		{/each}
	</Select.Content>
	<Select.Input name="aiProvider" />
</Select.Root>
