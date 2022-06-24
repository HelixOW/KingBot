import { SlashCommandBuilder } from "@discordjs/builders";
import { ICommand } from "../interfaces/i-command";

export default class FindCommand extends ICommand {
	get data(): any {
		return new SlashCommandBuilder()
			.setName("find")
			.setDescription("Check if unit is present.")
			.addStringOption(option => option.setName("unit").setDescription("What unit do you want to find? (Name or ID)").setRequired(true))
			.addBooleanOption(option => option.setName("custom").setDescription("Do you want to include custom units?"));
	}
}
