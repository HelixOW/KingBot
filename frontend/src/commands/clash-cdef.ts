import { ICommand } from "../interfaces/i-command";
import { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";
export default class ClashCommand extends ICommand {
	get data(): any {
		return new SlashCommandBuilder()
			.setName("clash")
			.setDescription("General clash command")
			.addSubcommand(sub => sub.setName("join").setDescription("Joins the clash group."))
			.addSubcommand(sub => sub.setName("leave").setDescription("Leaves the clash group."))
			.addSubcommand(sub => sub.setName("info").setDescription("Displays current Season name and registered players"))
			.addSubcommandGroup(subG =>
				subG
					.setName("draft")
					.setDescription("Draft related commands")
					.addSubcommand(sub => sub.setName("start").setDescription("Starts the draft"))
					.addSubcommand(sub =>
						sub
							.setName("box")
							.setDescription("Shows current picked Units")
							.addMentionableOption(option => option.setName("of").setDescription("Whose picked units do you want to see?"))
					)
					.addSubcommand(sub =>
						sub
							.setName("trade")
							.setDescription("Trade a Unit with someone")
							.addMentionableOption(option => option.setName("with").setDescription("Who do you want to trade with?").setRequired(true))
							.addStringOption(option => option.setName("offer").setDescription("Which unit do you offer?").setRequired(true))
							.addStringOption(option => option.setName("request").setDescription("Which unit do you request?").setRequired(true))
					)
					.addSubcommand(sub =>
						sub
							.setName("change")
							.setDescription("Change your Unit for some other Unit which wasn't picked yet.")
							.addStringOption(option => option.setName("out").setDescription("The Unit you dont want anymore").setRequired(true))
							.addStringOption(option => option.setName("in").setDescription("The Unit you want to trade in.").setRequired(true))
					)
					.addSubcommand(sub =>
						sub
							.setName("pick")
							.setDescription("Pick a unit from Draftboard")
							.addStringOption(option => option.setName("unit").setDescription("Which unit do you want to pick?").setRequired(true))
					)
			);
	}
}
