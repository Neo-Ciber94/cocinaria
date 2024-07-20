import {
	fetchEventSource,
	type EventSourceMessage,
	type FetchEventSourceInit
} from '@microsoft/fetch-event-source';
import type { EventRecord } from './stream.js';

type _FetchEventSourceInit = Omit<
	FetchEventSourceInit,
	'onclose' | 'onerror' | 'onmessage' | 'openWhenHidden'
>;

type PropsAsUnion<TEvent extends EventRecord> = {
	[K in keyof TEvent]: { eventName: K; value: TEvent[K] };
}[keyof TEvent];

export type Data<TEvent extends EventRecord> = PropsAsUnion<TEvent>;

/**
 * Options to consume the stream.
 */
export type ConsumeOptions<TEvent extends EventRecord> = _FetchEventSourceInit & {
	/**
	 * When data from the server is received.
	 * @param data The data from the stream.
	 */
	onData: (data: Data<TEvent>) => void;

	/**
	 * When the event stream message is received.
	 * @param ev The server side event.
	 */
	onMessage?: (ev: EventSourceMessage) => void;

	/**
	 * When the event response is received.
	 * @param response The response from the server.
	 */
	onOpen?: (response: Response) => Promise<void>;

	/**
	 * When the event stream is closed.
	 */
	onClose?: () => void;

	/**
	 * When an error from the stream is received.
	 * @param err The error.
	 */
	onError?: (err?: unknown) => void;
};

/**
 * Connect to a server stream and recieve all the server-sent events.
 * @param url The url to fetch.
 * @param options The options to pass to the requst.
 */
export function consume<TEvent extends EventRecord = Record<string, unknown>>(
	url: string,
	options: ConsumeOptions<TEvent>
) {
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
		signal: abortController.signal,
		method: init.method ?? 'POST',
		openWhenHidden: true,
		onclose: onClose,
		async onopen(response) {
			if (!response.ok) {
				abortController.abort();
				onError?.(new Error(`Http error: ${response.status}`));
			}

			return onOpen?.(response);
		},
		onerror: onError,
		onmessage(ev) {
			onMessage?.(ev);

			const eventName = ev.event;
			const value = JSON.parse(ev.data);
			onData({ eventName, value });
		}
	});

	return () => {
		abortController.abort();
	};
}
