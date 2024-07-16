<script lang="ts">
	import { flyAndScale } from '$lib/utils/transitions';
	import { Dialog, Separator, Label } from 'bits-ui';

	import { fade } from 'svelte/transition';
	import KeyIcon from './icons/keyIcon.svelte';
	import { useApiKeyDialog } from '$lib/hooks/useApiKeyDialog.svelte';
	import AiProviderSelect from './AIProviderSelect.svelte';
	import { useApiKey } from '$lib/hooks/useApiKey.svelte';
	import { type AIProvider } from '$lib/common/types';

	const apiKeyDialogOpen = useApiKeyDialog();
	const apiKey = useApiKey();

	let key = $state<string | undefined>(apiKey.value?.key);
	let provider = $state<AIProvider | undefined>(apiKey.value?.provider);

	function handleSave() {
		if (key && provider) {
			apiKey.value = { key, provider };
			apiKeyDialogOpen.isOpen = false;
		}

	}

	function handleRemove() {
		apiKey.value = null;
		key = '';
		provider = undefined;
	}
</script>

<Dialog.Root
	open={apiKeyDialogOpen.isOpen}
	onOpenChange={(value) => {
		apiKeyDialogOpen.isOpen = value;
	}}
>
	<Dialog.Portal>
		<Dialog.Overlay
			transition={fade}
			transitionConfig={{ duration: 150 }}
			class="fixed inset-0 z-50 bg-black/80"
		/>
		<Dialog.Content
			transition={flyAndScale}
			class="fixed left-[50%] top-[50%] z-50 w-full max-w-[94%] translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-white p-5 shadow-md outline-none sm:max-w-[600px] md:w-full"
		>
			<Dialog.Title
				class="flex w-full items-center justify-center text-lg font-semibold tracking-tight"
			>
				Configure an API Key
			</Dialog.Title>
			<Separator.Root class="-mx-5 mb-6 mt-5 block h-px bg-neutral-200" />
			<Dialog.Description class="text-sm text-foreground-alt">
				Set an API key to be used to generate recipes
			</Dialog.Description>
			<div class="flex flex-col items-start gap-1 pb-11 pt-7">
				<Label.Root for="apiKey" class="text-sm font-medium">API Key</Label.Root>
				<div class="flex flex-row gap-1 items-center w-full">
					<form class="relative w-full" autocomplete="off">
						<input
							id="apiKey"
							class="inline-flex h-10 w-full items-center rounded-lg border border-neutral-200 bg-white px-4 text-sm hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-white"
							placeholder="API Key"
							type="password"
							name="api_key"
							autocomplete="off"
							bind:value={key}
							required
						/>

						<KeyIcon
							class="absolute right-4 top-0 bottom-0 translate-y-1/2 size-[22px] text-black/30"
						/>
					</form>
					<AiProviderSelect bind:selected={provider} />
				</div>
			</div>
			<div class="flex w-full gap-2 justify-end">
				<button
					onclick={handleRemove}
					class="inline-flex h-12 items-center justify-center rounded-lg bg-red-500 min-w-[100px] px-4 text-[15px] font-semibold text-white shadow hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 focus-visible:ring-offset-white"
				>
					Remove
				</button>
				<button
					onclick={handleSave}
					class="inline-flex h-12 items-center justify-center rounded-lg bg-black/80 min-w-[100px] px-4 text-[15px] font-semibold text-white shadow hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 focus-visible:ring-offset-white"
				>
					Save
				</button>
			</div>
			<Dialog.Close
				class="absolute right-5 top-5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
			>
				<div>
					<svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-gray-300" viewBox="0 0 24 24">
						<path
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="m7 7l10 10M7 17L17 7"
						/>
					</svg>

					<span class="sr-only">Close</span>
				</div>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
