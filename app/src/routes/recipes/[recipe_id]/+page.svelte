<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex flex-col min-h-dvh">
	<section class="w-full pt-12 md:pt-24 lg:pt-32 border-b">
		<div class="container space-y-10 xl:space-y-16 px-4 md:px-6">
			<div class="grid gap-4 md:grid-cols-2 md:gap-16">
				<div>
					<h1
						class="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]"
					>
						{data.recipe.name}
					</h1>
				</div>
				<img
					src="https://placehold.co/1270x600"
					width="1270"
					height="600"
					alt={data.recipe.name}
					class="mx-auto aspect-[4/3] overflow-hidden rounded-xl object-cover"
				/>
			</div>
		</div>
	</section>
	<section class="w-full py-12 md:py-24 lg:py-32">
		<div class="container grid gap-12 px-4 md:px-6 lg:grid-cols-[1fr_2fr]">
			<div class="space-y-6">
				<h2 class="text-2xl font-bold">Ingredients</h2>
				<ul class="grid gap-2 text-muted-foreground">
					{#each data.recipe.ingredients as ingredient}
						<li>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="mr-2 inline-block h-4 w-4"
							>
								<path d="M20 6 9 17l-5-5"></path>
							</svg>
							{ingredient}
						</li>
					{/each}
				</ul>
			</div>
			<div class="space-y-6">
				<h2 class="text-2xl font-bold">Instructions</h2>
				<ol class="grid gap-4 text-muted-foreground">
					{#each data.recipe.steps as step, idx}
						<li>
							<div class="flex items-start gap-2">
								<div
									class="mt-1 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
								>
									{idx + 1}
								</div>
								<p>
									{step}
								</p>
							</div>
						</li>
					{/each}
				</ol>
			</div>
		</div>
	</section>
</div>
