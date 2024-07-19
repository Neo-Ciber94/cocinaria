/* eslint-disable @typescript-eslint/no-explicit-any */

import {
	fetchEventSource,
	type EventSourceMessage,
	type FetchEventSourceInit
} from '@microsoft/fetch-event-source';

type _FetchEventSourceInit = Omit<
	FetchEventSourceInit,
	'onclose' | 'onerror' | 'onmessage' | 'openWhenHidden'
>;

type ConsumeOptions = _FetchEventSourceInit & {
	onData: (eventName: string, data: unknown) => void;
	onMessage?: (ev: EventSourceMessage) => void;
	onOpen?: (response: Response) => Promise<void>;
	onClose?: () => void;
	onError?: (err?: any) => void;
};

export function consume(url: string, options: ConsumeOptions) {
	const { onOpen, onClose, onError, onData, onMessage, ...init } = options;

	if (typeof window === 'undefined') {
		return;
	}

	const abortController = new AbortController();

	if (init.signal) {
		init.signal.addEventListener('abort', () => abortController.abort());
	}

	fetchEventSource(url, {
		...init,
		signal: init?.signal ?? abortController.signal,
		method: init.method ?? 'POST',
		openWhenHidden: true,
		onopen: onOpen,
		onclose: onClose,
		onerror: onError,
		onmessage(ev) {
			onMessage?.(ev);

			const data = JSON.parse(ev.data);
			onData(ev.event, data);
		}
	});

	return () => {
		abortController.abort();
	};
}
