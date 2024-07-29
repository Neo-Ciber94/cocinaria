<script lang="ts">
	import ShareIcon from '$components/icons/shareIcon.svelte';
	import { Button } from '$components/ui/button';
	import { cn } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	type Props = {
		class?: string;
		recipeId: string;
	};

	let props: Props = $props();

	function handleClick() {
		if (navigator.clipboard) {
			const recipeUrl = `${location.origin}/recipes/${props.recipeId}`;
			navigator.clipboard.writeText(recipeUrl).then(() => {
				toast.success('Copied', {
					dismissable: true,
					duration: 1000,
					position: 'top-center'
				});
			});
		}
	}
</script>

<Button
	title="Share"
	type="button"
	onclick={handleClick}
	class={cn(
		'mb-2 flex flex-row items-center justify-center gap-2 bg-neutral-800 px-4 text-white hover:bg-neutral-900',
		props.class
	)}
>
	<ShareIcon class="size-5" />
	<span> Share Link</span>
</Button>
