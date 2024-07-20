<script lang="ts">
	import { page } from '$app/stores';

	const errorMessage = $derived.by(() => {
		return `${$page.status}: ${$page.error?.message ?? 'Internal Error'}`;
	});
</script>

<section
	class="flex flex-col items-center justify-center p-10 w-full container mx-auto h-[var(--main-height)]"
>
	<div class="flex flex-col gap-4 items-center">
		{#if $page.status === 404}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 32 32"
				class="text-orange-300 size-32 sm:size-60"
			>
				<g fill="currentColor">
					<path
						d="M6.82 20.575v3.834A12.475 12.475 0 0 0 16.5 29c4.324 0 8.136-2.196 10.38-5.533v-5.374C26.112 23.136 21.757 27 16.5 27c-4.354 0-8.089-2.65-9.68-6.425m18.21-10.199V8.654a3.32 3.32 0 0 1 .184-1.116A12.459 12.459 0 0 0 16.5 4a12.45 12.45 0 0 0-7.976 2.875l.005.061l.001.027v2.7A10.476 10.476 0 0 1 16.5 6c3.514 0 6.624 1.726 8.53 4.376"
					/>
					<path
						d="M24.5 16.5a8 8 0 1 1-16 0a8 8 0 0 1 16 0m-8 7a7 7 0 1 0 0-14a7 7 0 0 0 0 14M29.99 7.94c0-.9-.73-1.63-1.63-1.63c-1.3 0-2.34 1.05-2.33 2.34v5.55c0 1.253.726 2.375 1.85 2.883V25.7c0 .52.42.94.94.94h.23c.52 0 .94-.42.94-.94zM6.82 6.31a.68.68 0 0 0-.68.68v2.69c0 .2-.16.35-.35.35c-.2 0-.35-.16-.35-.35V7.02c0-.37-.29-.7-.66-.71c-.39-.01-.71.3-.71.68v2.69c0 .2-.16.35-.35.35c-.2 0-.35-.16-.35-.35V7.02c0-.37-.29-.7-.66-.71c-.39-.01-.71.3-.71.68v4.58c0 .902.437 1.707 1.109 2.209c.601.339.601 1.891.601 1.891v10.02c0 .52.42.94.94.94h.23c.52 0 .94-.42.94-.94V15.67s0-1.491.601-1.891A2.757 2.757 0 0 0 7.53 11.57V6.99a.72.72 0 0 0-.71-.68"
					/>
				</g>
			</svg>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				class="text-orange-300 size-32 sm:size-60"
			>
				<path
					fill="currentColor"
					d="m9.4 14l2.6-2.6l2.6 2.6l1.4-1.4l-2.6-2.6L16 7.4L14.6 6L12 8.6L9.4 6L8 7.4l2.6 2.6L8 12.6zM2 22V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18H6zm3.15-6H20V4H4v13.125zM4 16V4z"
				/>
			</svg>
		{/if}

		<h1 class="font-bold font-mono text-3xl sm:text-[50px] text-center text-orange-300">
			{errorMessage}
		</h1>
	</div>
</section>
