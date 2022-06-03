import { SlashCommandBuilder } from "@discordjs/builders";
import { ICommand } from "../interfaces/i-command";

export default class AdminCommand extends ICommand {
	get data(): any {
		return new SlashCommandBuilder()
			.setName("admin")
			.setDescription("Add or modify units.")
			.addSubcommand(sub =>
				sub
					.setName("add")
					.setDescription("Add new Units.")
					.addStringOption(option => option.setName("name").setDescription("What's the name of the unit?").setRequired(true))
					.addStringOption(option => option.setName("simplename").setDescription("What's the simple name of the unit?").setRequired(true))
					.addStringOption(option => option.setName("iconurl").setDescription("A link to the icon").setRequired(true))
					.addStringOption(option => option.setName("emoji").setDescription("The number of the emoji").setRequired(true))
					.addStringOption(option =>
						option
							.setName("race")
							.setDescription("What race is the unit?")
							.addChoices([
								["Demon", "demon"],
								["Giant", "giant"],
								["Human", "human"],
								["Fairy", "fairy"],
								["God", "god"],
								["Unknown", "Unknown"],
							])
							.setRequired(true)
					)
					.addStringOption(option =>
						option
							.setName("type")
							.setDescription("What type is the unit?")
							.addChoices([
								["Red", "red"],
								["Green", "green"],
								["Blue", "blue"],
								["Dark", "dark"],
								["Light", "light"],
							])
							.setRequired(true)
					)
					.addStringOption(option =>
						option
							.setName("grade")
							.setDescription("What Rarity is the unit?")
							.addChoices([
								["SSR", "ssr"],
								["SR", "sr"],
								["R", "r"],
							])
							.setRequired(true)
					)
					.addStringOption(option =>
						option
							.setName("event")
							.setDescription("Which event does unit originate from?")
							.addChoices([
								["Grand Cross", "gc"],
								["Slime", "slime"],
								["Attack on Titan", "aot"],
								["King of Fighters", "kof"],
								["Valentines Day", "val"],
								["New Year", "ny"],
								["Halloween", "hw"],
								["Festival", "fes"],
								["Re: Zero", "re"],
								["Stranger Things", "st"],
								["Ragnarok", "ragna"],
							])
							.setRequired(true)
					)
					.addStringOption(option =>
						option
							.setName("affection")
							.setDescription("What's the units affection?")
							.addChoices([
								["Seven Deadly Sins", "sins"],
								["The 10 Commandments", "commandments"],
								["The 7 Catastrophes", "catastrophes"],
								["Holy Knights", "knight"],
								["Archangels", "angels"],
								["None", "none"],
							])
							.setRequired(true)
					)
					.addStringOption(option =>
						option
							.setName("banner")
							.setDescription("Which banner does Unit appear on?")
							.addChoices([
								["General", "general"],
								["Race I", "race one"],
								["Race II", "race two"],
								["Humans", "human"],
								["Ragnarok", "ragnarok"],
							])
					)
					.addStringOption(option => option.setName("altnames").setDescription("What are the unit alternative names?"))
			)
			.addSubcommand(sub =>
				sub
					.setName("edit")
					.setDescription("Edit a unit.")
					.addIntegerOption(option => option.setName("unitid").setDescription("ID of Unit to edit").setRequired(true))
					.addStringOption(option =>
						option
							.setName("key")
							.setDescription("What to change in the Unit?")
							.addChoices([
								["Name", "name"],
								["Simple name", "simple_name"],
								["Type", "unit_type"],
								["Race", "race"],
								["Event", "unit_event"],
								["Grade", "grade"],
								["Affection", "affection"],
								["Banner", "banner"],
								["Alternative Names", "altnames"],
								["Emote", "emoji"],
								["Icon URL", "icon_url"],
							])
							.setRequired(true)
					)
					.addStringOption(option => option.setName("value").setDescription("What's the new value of the previous defined key?").setRequired(true))
			)
			.addSubcommand(sub => sub.setName("reload").setDescription("Reload the unit data"));
	}
}
