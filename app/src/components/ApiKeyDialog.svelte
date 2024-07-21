<script lang="ts">
	import KeyIcon from './icons/keyIcon.svelte';
	import { useApiKeyDialog } from '$lib/hooks/useApiKeyDialog.svelte';
	import toast from 'svelte-french-toast';
	import { getResponseError } from '$lib/client/getResponseError';
	import type { AIProviderConfig } from '../routes/api/ai/provider/schema';
	import { useAIProvider } from '$lib/hooks/useAIProvider.svelte';
	import { cn } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import { Button } from '$components/ui/button/index.js';
	import * as Dialog from '$components/ui/dialog/index.js';
	import { Input } from '$components/ui/input/index.js';
	import { Label } from '$components/ui/label/index.js';
	import * as Alert from '$components/ui/alert/index.js';
	import SelectAiProvider, { AI_PROVIDER_ITEMS } from './SelectAIProvider.svelte';
	import LoadingIcon from './icons/loadingIcon.svelte';

	const apiKeyDialogOpen = useApiKeyDialog();
	const aiProvider = useAIProvider();
	const hasAIProvider = $derived(aiProvider.value != null);

	let apiKey = $state('');
	let aiProviderItem = $state(AI_PROVIDER_ITEMS.find((x) => x.value === aiProvider.value));
	let loading = $state(false);

	const selectedProvider = $derived(aiProviderItem?.value ?? null);
	const canSubmit = $derived(apiKey != null && selectedProvider != null);

	async function handleSave() {
		loading = true;

		try {
			const res = await fetch('/api/ai/provider', {
				method: 'POST',
				body: JSON.stringify({
					apiKey: $state.snapshot(apiKey),
					aiProvider: selectedProvider
				} as AIProviderConfig)
			});

			if (!res.ok) {
				const message = await getResponseError(res, 'Failed to set API Key');
				toast.error(message);
				return;
			}

			aiProvider.value = selectedProvider;
			apiKeyDialogOpen.isOpen = false;
		} finally {
			loading = false;
		}
	}

	async function handleRemove() {
		const res = await fetch('/api/ai/provider', {
			method: 'DELETE'
		});

		// @ts-expect-error We need to set null to reset it
		aiProviderItem = null;
		apiKey = '';

		if (!res.ok) {
			const message = await getResponseError(res, 'Failed to remove API Key');
			toast.error(message);
		}

		aiProvider.value = null;
	}
</script>

<Dialog.Root
	open={apiKeyDialogOpen.isOpen}
	onOpenChange={(value) => {
		apiKeyDialogOpen.isOpen = value;
	}}
>
	<Dialog.Content class="sm:max-w-[600px] md:w-[95vw]">
		<Dialog.Header>
			<Dialog.Title>Configure API Key</Dialog.Title>
			<Dialog.Description>Set an API key to be used to generate recipes</Dialog.Description>
		</Dialog.Header>

		<form class="flex flex-col items-start gap-1" autocomplete="off">
			<Label for="apiKey" class="text-sm font-medium">API Key</Label>
			<div class="flex flex-row gap-1 items-center w-full">
				<div class="w-full flex flex-row items-center gap-2 relative">
					<Input
						id="apiKey"
						class={cn('w-full px-4 text-sm', 'disabled:cursor-not-allowed disabled:bg-neutral-200')}
						placeholder="API Key"
						type="password"
						name="api_key"
						autocomplete="off"
						disabled={hasAIProvider}
						bind:value={apiKey}
						required
					/>

					<KeyIcon
						class="absolute right-2 top-1/2 bottom-0 -translate-y-1/2 size-[20px] text-black/30"
					/>
				</div>
				<SelectAiProvider bind:selected={aiProviderItem} disabled={hasAIProvider} />
			</div>

			{#if selectedProvider && selectedProvider !== 'openai'}
				<Alert.Root variant="warning" class="mt-2">
					<Icon icon="typcn:warning" class="text-yellow-500 size-6" />
					<Alert.Title>Warning</Alert.Title>
					<Alert.Description
						>We do not support <strong>image generation</strong> for this provider</Alert.Description
					>
				</Alert.Root>
			{/if}

			<Dialog.Footer class="mt-2">
				<Button
					class="min-w-[100px] flex flex-row gap-1 items-center"
					type="button"
					disabled={!canSubmit || loading}
					onclick={handleSave}
				>
					{#if loading}
						<LoadingIcon />
					{/if}
					Save
				</Button>
				<Button
					class="min-w-[100px] flex flex-row gap-1 items-center"
					type="button"
					disabled={loading}
					variant="destructive"
					onclick={handleRemove}
				>
					Remove
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
