import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageAttachment, CommandInteraction, CacheType } from "discord.js";
import { DefaultEmbed, ErrorEmbed } from "../../utils/embeds";
import { Race, Grade, Event, Type, Affection } from "../../utils/units";
import { getRandomUnit } from "../../utils/pvp_handler";
import { ICommand } from "../../utilities/ICommand";

export default class UnitCommand implements ICommand {
	get data(): any {
		return new SlashCommandBuilder()
			.setName("unit")
			.setDescription("Returns a random unit")
			.addStringOption(option =>
				option
					.setName("race")
					.setDescription("Does the Unit have a specific race?")
					.addChoices([
						["Demon", "demon"],
						["Giant", "giant"],
						["Human", "human"],
						["Fairy", "fairy"],
						["God", "god"],
						["Unknown", "Unknown"],
					])
			)
			.addStringOption(option =>
				option
					.setName("type")
					.setDescription("Does the Unit have a specific type?")
					.addChoices([
						["Red", "red"],
						["Green", "green"],
						["Blue", "blue"],
						["Dark", "dark"],
						["Light", "light"],
					])
			)
			.addStringOption(option =>
				option
					.setName("grade")
					.setDescription("Does the Unit have a specific grade?")
					.addChoices([
						["SSR", "ssr"],
						["SR", "sr"],
						["R", "r"],
					])
			)
			.addStringOption(option =>
				option
					.setName("event")
					.setDescription("What event does the unit come from?")
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
			)
			.addStringOption(option =>
				option
					.setName("affection")
					.setDescription("Does your unit have any affection?")
					.addChoices([
						["Seven Deadly Sins", "sins"],
						["The 10 Commandments", "commandments"],
						["The 7 Catastrophes", "catastrophes"],
						["Holy Knights", "knight"],
						["Archangels", "angels"],
						["None", "none"],
					])
			)
			.addStringOption(option => option.setName("name").setDescription("Does your unit have to match a name?"))
			.addStringOption(option =>
				option
					.setName("banner")
					.setDescription("Is the unit in any banner?")
					.addChoices([
						["General", "general"],
						["Race I", "race one"],
						["Race II", "race two"],
						["Humans", "human"],
						["Ragnarok", "ragnarok"],
					])
			);
	}
	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		let race = interaction.options.getString("race") === null ? null : [Race.fromString(interaction.options.getString("race"))];
		let type = interaction.options.getString("type") === null ? null : [Type.fromString(interaction.options.getString("type"))];
		let grade = interaction.options.getString("grade") === null ? null : [Grade.fromString(interaction.options.getString("grade"))];
		let event = interaction.options.getString("event") === null ? null : [Event.fromString(interaction.options.getString("event"))];
		let affection = interaction.options.getString("affection") === null ? null : [Affection.fromString(interaction.options.getString("affection"))];
		let names = interaction.options.getString("name") === null ? null : interaction.options.getString("name").split(",");
		let banners = interaction.options.getString("banner") === null ? null : interaction.options.getString("banner").split(",");

		let unit = getRandomUnit(race, type, grade, event, affection, names, banners, []);

		if (unit === null) return await interaction.reply({ embeds: [new ErrorEmbed(`Can't find any unit matching provided criteria`)] });

		await interaction.deferReply();
		await interaction.editReply({
			embeds: [new DefaultEmbed(unit.name).setColor(unit.type.toDiscordColor()).setImage("attachment://unit.jpg")],
			files: [new MessageAttachment((await unit.refreshIcon()).toBuffer(), "unit.jpg")],
		});
	}
}
