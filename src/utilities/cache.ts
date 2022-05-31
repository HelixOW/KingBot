import { Tedis } from "tedis";
import ICache from "../interfaces/i-cache";
import { Collection } from "discord.js";
import { Unit } from "../models/unit";

export abstract class RedisCache<C> implements ICache<C> {
	private internalCache = new Tedis({ host: "85.214.28.184", port: 6379 });

	async set(key: string, value: C): Promise<void> {
		await this.internalCache.set(key, JSON.stringify(value));
	}

	async get(key: string, cls: new () => C): Promise<C> {
		return Object.assign(new cls(), JSON.parse((await this.internalCache.get(key)).toString()));
	}

	async getAll(cls?: new () => C): Promise<C[]> {
		return await Promise.all((await this.internalCache.keys("*")).map(async key => await this.get(key, cls)));
	}
}

export class CollectionCache<C> implements ICache<C> {
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

class UnitCache extends CollectionCache<Unit> {
	async get(key: string): Promise<Unit> {
		return (await super.get(key)).loadIcon();
	}

	async getAll(): Promise<Unit[]> {
		return await Promise.all((await super.getAll()).map(async (u: Unit) => await u.loadIcon()));
	}
}

export const cacheType: any = CollectionCache;

export const unitCache: ICache<Unit> = new UnitCache();
export const bannerCache = new cacheType();
