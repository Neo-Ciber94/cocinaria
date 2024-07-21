export function getStringInitials(s: string, count: number) {
	return s.replace(/(?!\w|\d)/g, '').slice(0, count);
}
