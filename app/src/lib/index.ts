import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function delay(ms: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export class InvariantError extends Error {}

export function invariant<T>(condition: T, message: string): asserts condition {
	if (!condition) {
		throw new InvariantError(message);
	}
}
