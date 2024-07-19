export type StreamContext = {
	emit: (eventName: string, value: unknown) => void;
	close: () => Promise<void>;
};

export type CleanUp = () => void | Promise<void>;

export type StreamProducer = (
	context: StreamContext
) => Promise<void> | void | Promise<CleanUp> | CleanUp;

/**
 * Additional options to pass to the stream.
 */
export type StreamOptions = {
	/**
	 * Response initialization.
	 */
	init?: ResponseInit;

	/**
	 * Time in milliseconds to send ping events.
	 */
	ping?: number | boolean;
};

const encoder = new TextEncoder();

type CreateEmitterOptions = {
	controller: ReadableStreamDefaultController<Uint8Array>;
	abortController: AbortController;
};

function createEmitter({ controller, abortController }: CreateEmitterOptions) {
	let isOpen = true;
	let cleanUp: CleanUp = () => {};

	function emit(eventName: string, value: unknown) {
		if (!isOpen) {
			return;
		}

		if (eventName.includes('\n')) {
			throw new Error(`Event name cannot include line breaks`);
		}

		const id = crypto.randomUUID();

		const data = JSON.stringify(value);
		controller.enqueue(encoder.encode(`id: ${id}\n`));
		controller.enqueue(encoder.encode(`event: ${eventName}\n`));
		controller.enqueue(encoder.encode(`data: ${data}\n\n`));
	}

	async function close() {
		if (!isOpen) {
			return;
		}

		isOpen = false;

		try {
			await cleanUp();
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

	function setCleanUp(cleanUpFunction: CleanUp) {
		cleanUp = cleanUpFunction;
	}

	return {
		emit,
		close,
		setCleanUp
	};
}

const DEFAULT_PING_MS = 10_000;

/**
 * Create a stream for server-side events.
 * @param producer A function to stream the events.
 * @param options Additional options
 * @returns A response that streams the events to the client.
 */
export function stream(producer: StreamProducer, options?: StreamOptions) {
	const { init, ping } = options || {};

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

	let cleanUp: CleanUp | undefined = undefined;
	const abortController = new AbortController();

	const readableStream = new ReadableStream<Uint8Array>({
		async start(controller) {
			const { close, emit, setCleanUp } = createEmitter({
				controller,
				abortController
			});

			const pingInterval = setInterval(() => emit('ping', ''), pingMs);
			abortController.signal.addEventListener('abort', () => clearInterval(pingInterval));

			try {
				const cleanup = await producer({ emit, close });

				if (cleanup) {
					cleanUp = cleanup;
					setCleanUp(cleanup);
				}
			} catch (err) {
				if (cleanUp) {
					await cleanUp();
				}

				console.error(err);
				controller.error(err);
				abortController.abort();
			}
		},
		cancel() {
			abortController.abort();
		}
	});

	const headers = new Headers(init?.headers);
	headers.set('Content-Type', 'text/event-stream');
	headers.set('Cache-Control', 'no-cache');
	headers.set('Connection', 'keep-alive');

	return Promise.resolve(
		new Response(readableStream, {
			...init,
			headers
		})
	);
}
