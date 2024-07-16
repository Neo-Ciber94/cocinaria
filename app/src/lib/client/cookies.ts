export function setCookie(name: string, value: string, durationMs?: number) {
	let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

	if (durationMs) {
		const expirationDate = new Date();
		expirationDate.setTime(expirationDate.getTime() + durationMs);
		cookie += '; expires=' + expirationDate.toISOString();
	}

	document.cookie = cookie;
}

export function getCookie(name: string): string | null {
	const cookieString = document.cookie;
	const cookies = cookieString.split('; ');

	for (const cookie of cookies) {
		const [cookieName, cookieValue] = cookie.split('=');
		if (cookieName === name) {
			return decodeURIComponent(cookieValue);
		}
	}

	return null;
}

export function removeCookie(name: string) {
	setCookie(name, '', -1);
}
