import { SlashCommandBuilder } from "@discordjs/builders";
import { ICommand } from "../../interfaces/i-command";

export default class WhaleCommand extends ICommand {
	get data(): any {
		return new SlashCommandBuilder()
			.setName("whale")
			.setDescription("Summon until you get a SSR or desired Unit.")
			.addStringOption(option => option.setName("banner").setDescription("Which banner do you want to pull from?"))
			.addMentionableOption(option => option.setName("for").setDescription("Who do you want to whale for?"))
			.addStringOption(option => option.setName("unit").setDescription("Who do you want to whale for? (Leave blank for any SSR)"));
	}
}
