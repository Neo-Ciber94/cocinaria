export type EventRecord = {
	[eventName: string]: unknown;
};

export type StreamContext<TEvent extends EventRecord> = {
	emit: <K extends keyof TEvent>(eventName: K, value: TEvent[K]) => void;
	close: () => Promise<void>;
};

export type CleanUp = () => void | Promise<void>;

export type StreamSource<TEvent extends EventRecord> = (
	context: StreamContext<TEvent>
) => Promise<void> | void | Promise<CleanUp> | CleanUp;

/**
 * Additional options to pass to the stream.
 */
export type StreamOptions = ResponseInit & {
	/**
	 * Time in milliseconds to send ping events.
	 */
	ping?: number | boolean;
};

const encoder = new TextEncoder();

type CreateEmitterContext = {
	controller: ReadableStreamDefaultController<Uint8Array>;
	abortController: AbortController;
	cleanup?: CleanUp;
};

type CreateEmitterOptions = {
	context: CreateEmitterContext;
};

function createEmitter<TEvent extends EventRecord>({ context }: CreateEmitterOptions) {
	const { controller, abortController } = context; // IMPORTANT! don't spread the cleanup, we assign it from the stream

	let id = 0;
	let isOpen = true;

	function getId() {
		return ++id;
	}

	function emit<K extends keyof TEvent>(eventName: K, value: TEvent[K]) {
		if (!isOpen) {
			return;
		}

		if ((eventName as string).includes('\n')) {
			throw new Error(`Event name cannot include line breaks`);
		}

		const id = getId();
		const data = JSON.stringify(value);

		controller.enqueue(encoder.encode(`id: ${id}\n`));
		controller.enqueue(encoder.encode(`event: ${String(eventName)}\n`));
		controller.enqueue(encoder.encode(`data: ${data}\n\n`));
	}

	async function close() {
		if (!isOpen) {
			return;
		}

		isOpen = false;

		try {
			if (context.cleanup) {
				await context.cleanup();
			}
		} finally {
			try {
				abortController.abort();
				controller.close();
			} catch {
				// ignore
			}
		}
	}

	abortController.signal.addEventListener('abort', close);

	return {
		emit,
		close
	};
}

const DEFAULT_PING_MS = 10_000;

/**
 * Create a stream for server-side events.
 * @param source A function that creates the event stream.
 * @param options Stream response options.
 * @returns A response that streams the events to the client.
 */
export function stream<TEvent extends EventRecord = Record<string, unknown>>(
	source: StreamSource<TEvent>,
	options?: StreamOptions
) {
	const { ping, ...init } = options || {};

	const pingMs = (() => {
		if (ping === false) {
			return -1;
		}

		if (ping === true || !ping) {
			return DEFAULT_PING_MS;
		}

		if (ping < 0) {
			throw new Error('Ping should be a positive number');
		}

		return ping;
	})();

	const abortController = new AbortController();

	const readableStream = new ReadableStream<Uint8Array>({
		async start(controller) {
			const context: CreateEmitterContext = { controller, abortController };
			const { close, emit } = createEmitter<TEvent>({ context });

			if (pingMs > 0) {
				// @ts-expect-error Ping events don't need to be typed
				const pingInterval = setInterval(() => emit('ping', ''), pingMs);
				abortController.signal.addEventListener('abort', () => clearInterval(pingInterval));
			}

			try {
				const cleanup = await source({ emit, close });

				if (cleanup) {
					context.cleanup = cleanup;
				}
			} catch (err) {
				console.error(err);

				try {
					if (context.cleanup) {
						await context.cleanup();
					}
				} finally {
					controller.error(err);
					abortController.abort();
				}
			}
		},
		cancel() {
			abortController.abort();
		}
	});

	return new Response(readableStream, {
		...init,
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			...init.headers
		}
	});
}
