export default interface ICache<C> {
	set(key: string, value: C): Promise<void>;
	get(key: string, cls?: new () => C): Promise<C>;
	getAll(cls?: new () => C): Promise<C[]>;
}
