import { CommandInteraction, CacheType } from "discord.js";
import ICommandExecutor from "../interfaces/i-command-executor";

export default class DefaultCExecutor implements ICommandExecutor {
	commandName(): string {
		throw new Error("Method not implemented.");
	}
	execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		throw new Error("Module with this command not loaded.");
	}
}
