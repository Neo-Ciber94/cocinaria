<script lang="ts" context="module">
	export type AIProviderSelectItem = { value: AIProvider; label: string; icon: unknown };

	// We only use openAI because we generate the images also using OpenAI,
	// the recipes text could be generated with any provider
	export const AI_PROVIDER_ITEMS = [
		{ value: 'openai', label: 'OpenAI', icon: OpenaiIcon },
		{ value: 'claude', label: 'Claude', icon: ClaudeaiIcon },
		{ value: 'gemini', label: 'Gemini', icon: GeminiAi }
	] satisfies AIProviderSelectItem[];
</script>

<script lang="ts">
	import * as Select from '$components/ui/select/index.js';
	import { useIsMounted } from '$lib/hooks/useIsMounted.svelte';
	import type { AIProvider } from '$lib/common/types';
	import OpenaiIcon from './icons/openaiIcon.svelte';
	import GeminiAi from './icons/geminiAiIcon.svelte';
	import ClaudeaiIcon from './icons/claudeaiIcon.svelte';
	import { cn } from '$lib/utils';

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
	<Select.Trigger class={cn('w-[180px]', rest.class)}>
		{#if mounted.value && selectedProvider}
			<svelte:component this={selectedProvider.icon} class="mr-[9px] size-6" />
		{/if}
		<Select.Value placeholder="Provider" />
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.Label>Provider</Select.Label>
			{#each AI_PROVIDER_ITEMS as aiProvider}
				{@const isSelected = selected?.value === aiProvider.value}
				<Select.Item class={'gap-2'} value={aiProvider.value} label={aiProvider.label}>
					<svelte:component
						this={aiProvider.icon}
						class={cn('size-6 opacity-50 group-hover:opacity-90', isSelected && 'opacity-90')}
					/>
					{aiProvider.label}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
	<Select.Input name="aiProvider" />
</Select.Root>
