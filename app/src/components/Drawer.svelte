<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';

	type Props = {
		open?: boolean;
		onclose?: () => void;
		children?: Snippet;
		transitionDurationMs?: number;
		closeRatio?: number;
		dragStartDistance?: number;
	};

	let {
		children,
		open = $bindable(false),
		onclose,
		transitionDurationMs = 200,
		closeRatio = 0.5,
		dragStartDistance = 100
	}: Props = $props();

	let containerRef = $state<HTMLDivElement>();
	let isDragging = $state(false);
	let startYPos = $state(0);
	let yPos = $state(0);
	let drawerHeight = $state(0);
	let prevBodyStyleOverflow = $state<string>();

	function handleClose() {
		open = false;
		yPos = 0;
		onclose?.();
	}

	$effect(() => {
		function handleKeyboard(ev: KeyboardEvent) {
			if (ev.key === 'Escape') {
				handleClose();
			}
		}

		window.addEventListener('keydown', handleKeyboard);
		return () => {
			window.addEventListener('keydown', handleKeyboard);
		};
	});

	$effect(() => {
		if (open && !isDragging && containerRef) {
			drawerHeight = containerRef.getBoundingClientRect().height;
		}
	});

	$effect(() => {
		if (open) {
			prevBodyStyleOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = document.body.style.overflow || '';
		}
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		role="alert"
		class="fixed left-0 top-0 z-10 h-full w-full bg-black/70"
		onclick={handleClose}
		transition:fade={{ duration: transitionDurationMs }}
	></div>

	<div
		bind:this={containerRef}
		class={cn('bg-background fixed bottom-0 left-0 z-10 w-full overflow-hidden rounded-t-lg', {
			'transition-transform duration-500': !isDragging
		})}
		style:transform={`translateY(${yPos}px)`}
		transition:slide={{ duration: transitionDurationMs, easing: quintOut, axis: 'y' }}
	>
		<button
			class="mx-auto my-3 block h-2 w-2/6 rounded-lg bg-neutral-300"
			ontouchstart={(ev) => {
				isDragging = true;
				startYPos = ev.touches[0].clientY;
			}}
			ontouchend={() => {
				isDragging = false;

				const closeDistance = drawerHeight * closeRatio;
				if (yPos > closeDistance) {
					handleClose();
				} else {
					yPos = 0;
				}
			}}
			ontouchmove={(ev) => {
				const clientY = ev.touches[0].clientY;
				const distance = clientY - startYPos;

				if (distance > 0 && distance > dragStartDistance) {
					yPos = distance - dragStartDistance;
				}
			}}
		></button>

		{#if children}
			{@render children()}
		{:else}
			<div class="h-[300px] w-full"></div>
		{/if}
	</div>
{/if}
