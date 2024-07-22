export type AlertProps = {
	id: string;
	isOpen: boolean;
	title: string;
	description?: string;
	resolve: (result: boolean) => void;
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
		confirm(props: Omit<AlertProps, 'id' | 'isOpen' | 'resolve'>) {
			const { promise, resolve } = Promise.withResolvers<boolean>();
			const id = crypto.randomUUID();
			alerts.push({
				...props,
				id,
				resolve,
				isOpen: true
			});

			return promise;
		},
		remove(id: string) {
			alerts = alerts.filter((x) => x.id !== id);
		}
	};
}
