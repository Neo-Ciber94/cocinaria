<script lang="ts">
	import * as Tooltip from '$components/ui/tooltip/index.js';
	import * as Avatar from '$components/ui/avatar/index.js';
	import { getStringInitials } from '$lib/utils/getStringInitials';

	type Props = {
		ownerUsername: string;
		ownerPicture?: string | null;
		generatedAt: Date;
	};

	let { ownerUsername, ownerPicture, generatedAt }: Props = $props();

	const formatter = new Intl.DateTimeFormat(undefined, {
		year: 'numeric',
		month: 'long',
		day: '2-digit'
	});
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		<div class="flex flex-row gap-2 items-center cursor-pointer">
			<Avatar.Root class="w-7 h-7">
				<Avatar.Image src={ownerPicture} alt={ownerUsername} />
				<Avatar.Fallback class="bg-orange-500 text-white font-bold text-sm">
					{getStringInitials(ownerUsername, 2).toUpperCase()}
				</Avatar.Fallback>
			</Avatar.Root>
			<p class="text-neutral-500 font-medium text-[13px]">
				{ownerUsername}
			</p>
		</div>
	</Tooltip.Trigger>
	<Tooltip.Content>
		<p>Generated: {formatter.format(generatedAt)}</p>
	</Tooltip.Content>
</Tooltip.Root>
