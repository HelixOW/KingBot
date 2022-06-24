import { Unit } from "../models/unit";

export default interface IUnitDataHandler {
	readUnits(): Promise<boolean>;
	registerUnit(unit: Unit): Promise<boolean>;
	editUnit(unit: Unit, key: string, value: any): Promise<boolean>;
	newestUnitId(): Promise<number>;

	refreshTask(): Promise<void>;
}
