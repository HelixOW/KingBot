import { SlashCommandBuilder } from "@discordjs/builders";
import { ICommand } from "../../interfaces/i-command";

export default class MultiCommand extends ICommand {
	get data(): any {
		return new SlashCommandBuilder()
			.setName("multi")
			.setDescription("Do a multi on any current banner.")
			.addStringOption(option => option.setName("banner").setDescription("Which banner do you want to pull from?"))
			.addMentionableOption(option => option.setName("for").setDescription("Who do you want to do a multi for?"))
			.addIntegerOption(option => option.setName("amount").setDescription("How many multis do you want to do?"));
	}
}
