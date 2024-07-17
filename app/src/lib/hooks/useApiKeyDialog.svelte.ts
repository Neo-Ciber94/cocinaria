let isDialogOpen = $state(false);

export function useApiKeyDialog() {
	return {
		get isOpen() {
			return isDialogOpen;
		},
		set isOpen(open: boolean) {
			isDialogOpen = open;
		}
	};
}
