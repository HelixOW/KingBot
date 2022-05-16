export default interface ICache<C> {
	set(key: string, value: C): Promise<void>;
	get(key: string): Promise<C>;
}
