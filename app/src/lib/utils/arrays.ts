export function shuffleArrayInPlace<T>(arr: T[]) {
	for (let i = 0; i < arr.length; i++) {
		const newIdx = Math.floor(Math.random() * arr.length);
		swap(arr, i, newIdx);
	}

	return arr;
}

function swap<T>(arr: T[], from: number, to: number) {
	const temp = arr[from];
	arr[from] = arr[to];
	arr[to] = temp;
}
