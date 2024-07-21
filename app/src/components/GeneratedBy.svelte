<script lang="ts">
	import * as Tooltip from '$components/ui/tooltip/index.js';
	import * as Avatar from '$components/ui/avatar/index.js';
	import { getStringInitials } from '$lib/utils/getStringInitials';
	import { relativeTime } from '$lib/hooks/relativeTime.svelte';

	type Props = {
		ownerUsername: string;
		ownerPicture?: string | null;
		generatedAt: Date;
	};

	let { ownerUsername, ownerPicture, generatedAt }: Props = $props();
	const time = relativeTime(generatedAt);
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		<div class="flex cursor-pointer flex-row items-center gap-2">
			<Avatar.Root class="h-7 w-7">
				<Avatar.Image src={ownerPicture} alt={ownerUsername} />
				<Avatar.Fallback class="bg-orange-500 text-sm font-bold text-white">
					{getStringInitials(ownerUsername, 2).toUpperCase()}
				</Avatar.Fallback>
			</Avatar.Root>
			<p class="text-[13px] font-medium text-neutral-500">
				{ownerUsername}
			</p>
		</div>
	</Tooltip.Trigger>
	<Tooltip.Content>
		<p>Generated <span class="text-amber-300"> {time.value}</span></p>
	</Tooltip.Content>
</Tooltip.Root>
