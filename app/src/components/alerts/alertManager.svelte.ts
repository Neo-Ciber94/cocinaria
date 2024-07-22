export type AlertProps = {
	id: string;
	isOpen: boolean;
	title: string;
	description?: string;
	actions?: {
		cancel?: { label: string };
		confirm?: { label: string };
	};
};

let alerts = $state<AlertProps[]>([]);

export function useAlertManager() {
	return {
		get alerts() {
			return alerts;
		},
		openAlert(props: Omit<AlertProps, 'id' | 'isOpen'>) {
			console.log(props);
			const id = crypto.randomUUID();
			alerts = [
				...alerts,
				{
					...props,
					id,
					isOpen: true
				}
			];
		},
		removeAlert(id: string) {
			alerts = alerts.filter((x) => x.id !== id);
		}
	};
}
