import { Tedis } from "tedis";
import ICache from "../interfaces/ICache";
import { Collection } from "discord.js";
import { Unit } from "../models/unit";

export class RedisCache<C> implements ICache<C> {
	private internalCache = new Tedis({ host: "85.214.28.184", port: 6379 });

	async set(key: string, value: C): Promise<void> {
		await this.internalCache.set(key, JSON.stringify(value));
	}

	async get(key: string): Promise<C> {
		return JSON.parse((await this.internalCache.get(key)).toString());
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
}

export const cacheType: any = RedisCache;

export const unitCache: ICache<Unit> = new cacheType();
export const bannerCache = new cacheType();
