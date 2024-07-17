const SERVER_ERROR = 'Internal Error';

export async function getResponseError(
	response: Response,
	clientError: string = 'Response Error'
) {
	const status = response.status;
	const defaultMessage = isServerError(status) ? SERVER_ERROR : clientError || SERVER_ERROR;

	if (response.headers.get('content-type') === 'application/json') {
		const json = await response.json();
		if (typeof json?.message === 'string') {
			return json.message as string;
		}

		return defaultMessage;
	}

	return defaultMessage;
}

function isServerError(status: number) {
	return status >= 500;
}
