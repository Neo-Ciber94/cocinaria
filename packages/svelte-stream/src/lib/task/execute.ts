import { consume } from '$lib/consume.js';
import type { FetchEventSourceInit } from '@microsoft/fetch-event-source';
import { TaskError, type TaskActionEvents } from './task.js';

/**
 * Options to pass to the request.
 */
export type ExecuteOptions = Omit<
	FetchEventSourceInit,
	'onclose' | 'onerror' | 'onmessage' | 'openWhenHidden'
>;

/**
 * Call a server task and returns a promise that resolve or reject with the server data.
 * @param url The url to fetch.
 * @param options The options to pass to the request.
 * @returns A promise that resolves to the result from the server, or an error if fails.
 */
export function execute<T>(url: string, options?: ExecuteOptions) {
	return new Promise<T>((resolve, reject) => {
		consume<TaskActionEvents<T>>(url, {
			...options,
			onError(err) {
				console.error(err);
				reject(new Error('Failed to execute task'));
			},
			onData({ eventName, value }) {
				switch (eventName) {
					case 'success': {
						return resolve(value);
					}
					case 'failure': {
						return reject(new TaskError(value));
					}
					case 'internalError': {
						return reject(new Error(value));
					}
				}
			}
		});
	});
}
