/* eslint-disable @typescript-eslint/no-explicit-any */

// Utility type to push an element into a tuple
type Push<T extends any[], V> = [...T, V];

// Utility type to convert a union to an intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
	? I
	: never;

// Utility type to convert union to tuple
type UnionToTuple<U> = UnionToIntersection<U extends any ? (x: U) => void : never> extends (
	x: infer I
) => void
	? [...UnionToTuple<Exclude<U, I>>, I]
	: [];

export type KeysTuple<T> = UnionToTuple<keyof T>;
