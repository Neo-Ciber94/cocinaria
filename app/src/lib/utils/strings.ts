export function getStringInitials(s: string, count: number) {
	return s.replace(/(?!\w|\d)/g, '').slice(0, count);
}

export function capitalize(s: string) {
	return s
		.split(' ')
		.map((chars) => chars[0].toUpperCase() + chars.slice(1).toLowerCase())
		.join(' ');
}
