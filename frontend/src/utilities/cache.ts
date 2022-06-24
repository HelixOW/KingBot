import { Collection } from "discord.js";
import { Unit } from "../models/unit";

export class CollectionCache<C> {
	private internalCollection: Collection<string, C> = new Collection();

	async set(key: string, value: C): Promise<void> {
		this.internalCollection.set(key, value);
	}

	async get(key: string): Promise<C> {
		return this.internalCollection.get(key);
	}

	async getAll(): Promise<C[]> {
		return [...this.internalCollection.values()];
	}
}

class UnitCache {
	private internalCollection: Collection<string, Unit> = new Collection();

	set(key: string, value: Unit): void {
		this.internalCollection.set(key, value);
	}

	get(key: string): Unit {
		return this.internalCollection.get(key);
	}

	getAndLoad(key: string): Unit {
		return this.get(key).loadIcon();
	}

	getAll(): Unit[] {
		return [...this.internalCollection.values()];
	}

	getAllLoaded(): Unit[] {
		return this.getAll().map((u: Unit) => u.loadIcon());
	}

	clear(): void {
		this.internalCollection.clear();
	}
}

export const unitCache: UnitCache = new UnitCache();
export const bannerCache = new CollectionCache();
