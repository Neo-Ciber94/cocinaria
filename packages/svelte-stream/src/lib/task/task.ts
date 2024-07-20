import { stream, type StreamOptions } from '$lib/stream.js';

/**
 * An action to execute.
 */
export type TaskAction<T> = () => Promise<T> | T;

/**
 * @internal
 */
export type TaskActionEvents<T> = {
	executing: '';
	success: T;
	failure: string;
	internalError: string;
};

/**
 * An action that ocurred in an action that is send to the client.
 */
export class TaskError extends Error {}

export type TaskActionOptions = StreamOptions;

/**
 * Create a response that stream the result to the client when resolve.
 * @param action The action to execute.
 * @param options Options to pass to the response.
 * @returns A response that resolve to the stream.
 */
export function task<T>(action: TaskAction<T>, options?: TaskActionOptions) {
	return stream<TaskActionEvents<T>>(
		async ({ emit, close }) => {
			try {
				emit('executing', '');
				const result = await action();
				emit('success', result);
			} catch (err) {
				if (err instanceof TaskError) {
					emit('failure', err.message);
				} else if (err instanceof Error) {
					const message = process.env.NODE_ENV !== 'production' ? err.message : 'Internal Error';
					emit('internalError', message);
				}
			} finally {
				await close();
			}
		},
		{
			// We don't really need a ping, we send a 'excuting' event
			ping: false,
			...options
		}
	);
}
