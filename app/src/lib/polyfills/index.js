/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

/*! groupby-polyfill. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

/**
 * Groups elements from an iterable into an object based on a callback function.
 *
 * @template T, K
 * @param {Iterable<T>} iterable - The iterable to group.
 * @param {function(T, number): K} callbackfn - The callback function to
 * determine the grouping key.
 * @returns {Object.<string, T[]>} An object where keys are the grouping keys
 * and values are arrays of grouped elements.
 */
Object.groupBy ??= function groupBy(iterable, callbackfn) {
	const obj = Object.create(null);
	let i = 0;
	for (const value of iterable) {
		const key = callbackfn(value, i++);
		key in obj ? obj[key].push(value) : (obj[key] = [value]);
	}
	return obj;
};

/**
 * Groups elements from an iterable into a Map based on a callback function.
 *
 * @template K, T
 * @param {Iterable<T>} iterable - The iterable to group.
 * @param {function(T, number): K} callbackfn - The callback function to
 * determine the grouping key.
 * @returns {Map<K, T[]>} A Map where keys are the grouping keys and values are
 * arrays of grouped elements.
 */
Map.groupBy ??= function groupBy(iterable, callbackfn) {
	const map = new Map();
	let i = 0;
	for (const value of iterable) {
		const key = callbackfn(value, i++),
			list = map.get(key);
		list ? list.push(value) : map.set(key, [value]);
	}
	return map;
};

/**
 * Creates a new Promise and returns it in an object, along with its resolve and reject functions.
 * @returns
 * An object with the properties promise, resolve, and reject.
 */
Promise.withResolvers ??= function withResolvers() {
	let resolve = (value) => {};
	let reject = (err) => {};

	const promise = new Promise((resolveFunction, rejectFunction) => {
		resolve = resolveFunction;
		reject = rejectFunction;
	});

	return { promise, resolve, reject };
};
