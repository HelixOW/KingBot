import { Collection } from "discord.js";

export function getRandom(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function getRandomInt(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return ((Math.random() * (max - min)) | 0) + min;
}

export function getRandomArrayValue<T>(array: T[]): T {
	return array[module.exports.getRandomInt(0, array.length - 1)];
}

export function chunk<T>(array: T[], chunkSize: number): Array<T[]> {
	const res: Array<T[]> = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		const chunk = array.slice(i, i + chunkSize);
		res.push(chunk);
	}
	return res;
}

export function chunkMap<A, B>(map: Collection<A, B>, chunkSize: number): Array<[A, B]>[] {
	return chunk([...map], chunkSize);
}

export function removeItems<T>(array: T[], value: T): T[] {
	let i = 0;
	while (i < array.length) {
		if (array[i] === value) array.splice(i, 1);
		else ++i;
	}
	return array;
}

export function removeItem<T>(array: T[], value: T, amount: number = 1): T[] {
	let i = 0;
	let amountCount = 0;
	while (i < array.length && amountCount < amount) {
		if (array[i] === value) {
			array.splice(i, 1);
			amountCount++;
		} else ++i;
	}
	return array;
}
