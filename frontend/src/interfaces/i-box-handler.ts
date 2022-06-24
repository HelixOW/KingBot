import { GuildMember } from "discord.js";
import { Unit } from "../utils/units";

export default interface IBoxHandler {
	addToBox(owner: GuildMember, units: Unit[]): Promise<boolean>;
	hasBox(owner: GuildMember): Promise<boolean>;
	getBox(owner: GuildMember): Promise<{ unit_id: number; amount: number; unit: Unit }[]>;

	refreshTask(): Promise<void>;
}
