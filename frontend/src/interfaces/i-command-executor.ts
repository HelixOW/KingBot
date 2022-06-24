import { CommandInteraction } from "discord.js";

export default interface ICommandExecutor {
	commandName(): string;
	execute(interaction: CommandInteraction): Promise<any>;
}
