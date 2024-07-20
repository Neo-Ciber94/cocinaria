import { parse } from 'devalue';

export async function fetchServer<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, init);
	const contents = await res.text();
	const isJson = res.headers.get('Content-Type') === 'application/json';

	if (!isJson) {
		throw new Error('Invalid response');
	}

	const json = parse(contents);

	if (!res.ok) {
		const error = getJsonError(json) ?? `Http Error: ${res.status}`;
		throw new Error(error);
	}

	return json as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getJsonError(err: any) {
	if (!err) {
		return null;
	}

	if (typeof err.error === 'string') {
		return err.error;
	}

	if (typeof err.message === 'string') {
		return err.message;
	}

	return null;
}