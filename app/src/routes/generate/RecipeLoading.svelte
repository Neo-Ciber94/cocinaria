<script lang="ts">
	type Props = {
		images: string[];
	};

	let { images }: Props = $props();

	const items: string[] = [];
	const max = Math.max(5, images.length);

	for (let i = 0; i < max; i++) {
		const item = images[i % images.length];
		items.push(item);
	}

	const rotations = 5;
	const animationDurationMs = 20_000;
	const delayMs = animationDurationMs / items.length / rotations / 2;
</script>

<div class="relative aspect-square w-full">
	{#each items as emoji, idx}
		<span
			class="recipe-ingredient"
			style={`--duration: ${animationDurationMs}ms; --delay: ${delayMs * idx}ms`}
		>
			{emoji}
		</span>
	{/each}
</div>

<style>
	.recipe-ingredient {
		position: absolute;
		opacity: 0;
		font-size: 40px;
		left: 50%;
		top: 50%;
		transform-origin: 0% 0%;
		animation: rotateAndFade var(--duration) linear var(--delay) infinite;
	}

	@keyframes rotateAndFade {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) rotate(0deg) translate(150%) rotate(0deg);
		}
		10% {
			opacity: 1;
			transform: translate(-50%, -50%) rotate(360deg) translate(150%) rotate(-360deg);
		}
		20% {
			transform: translate(-50%, -50%) rotate(720deg) translate(150%) rotate(-720deg);
		}
		40% {
			transform: translate(-50%, -50%) rotate(1440deg) translate(150%) rotate(-1440deg);
		}
		60% {
			transform: translate(-50%, -50%) rotate(2160deg) translate(150%) rotate(-2160deg);
		}
		80% {
			opacity: 1;
			transform: translate(-50%, -50%) rotate(2880deg) translate(150%) rotate(-2880deg);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -50%) rotate(3600deg) translate(150%) rotate(-3600deg);
		}
	}
</style>
