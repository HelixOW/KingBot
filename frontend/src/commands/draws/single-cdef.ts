import { SlashCommandBuilder } from "@discordjs/builders";
import { ICommand } from "../../interfaces/i-command";

export default class SingleCommand extends ICommand {
	get data(): any {
		return new SlashCommandBuilder()
			.setName("single")
			.setDescription("Do a single on any current banner.")
			.addStringOption(option => option.setName("banner").setDescription("Which banner do you want to pull from?"))
			.addMentionableOption(option => option.setName("for").setDescription("Who do you want to do a single for?"))
			.addIntegerOption(option => option.setName("amount").setDescription("How many singles do you want to do?"));
	}
}
