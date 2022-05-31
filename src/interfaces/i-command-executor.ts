import { CommandInteraction } from "discord.js";

export default interface ICommandExecutor {
	execute(interaction: CommandInteraction): Promise<any>;
}
