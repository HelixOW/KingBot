import { Pool } from "pg";

const dbConfig = require("../../data/database.json");

export class DatabaseHandler {
	private _pool = new Pool(dbConfig);

	public get pool(): Pool {
		return this._pool;
	}
}

export const databaseHandler: DatabaseHandler = new DatabaseHandler();
