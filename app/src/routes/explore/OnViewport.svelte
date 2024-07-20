<script lang="ts">
	type Props = { class?: string; delayMs?: number; onVisible: (visible: boolean) => void };

	let { onVisible, delayMs = 0, ...rest }: Props = $props();

	let nextEl = $state<HTMLElement>();
	let ready = $state(delayMs <= 0);

	$effect(() => {
		if (delayMs <= 0) {
			return;
		}

		const timeout = window.setTimeout(() => {
			ready = true;
		}, delayMs);

		return () => {
			clearTimeout(timeout);
		};
	});

	$effect(() => {
		if (!nextEl || !ready) {
			return;
		}

		// Initial check to see if the element is already visible
		const checkVisibility = (el: HTMLElement) => {
			const rect = el.getBoundingClientRect();
			return (
				rect.top >= 0 &&
				rect.left >= 0 &&
				rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
				rect.right <= (window.innerWidth || document.documentElement.clientWidth)
			);
		};

		const isInitiallyVisible = checkVisibility(nextEl);
		onVisible(isInitiallyVisible);

		const observer = new IntersectionObserver((entries) => {
			const isVisible = entries.some((x) => x.isIntersecting);
			onVisible(isVisible);
		});

		observer.observe(nextEl);

		return () => {
			observer.disconnect();
		};
	});
</script>

<div class={rest.class} bind:this={nextEl}></div>
