import { SlashCommandBuilder } from "@discordjs/builders";
import { ICommand } from "../../interfaces/i-command";

export default class BoxCommand extends ICommand {
	get data(): any {
		return new SlashCommandBuilder()
			.setName("box")
			.setDescription("Shows the box.")
			.addMentionableOption(option => option.setName("for").setDescription("Who do you want to do a single for?"));
	}
}
