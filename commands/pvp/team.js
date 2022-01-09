const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageAttachment } = require("discord.js");
const { DefaultEmbed, ErrorEmbed } = require("../../utils/embeds");
const { mapRace, mapAttribute, mapGrade, mapEvent } = require("../../utils/units_helper");
const { getRandomTeam } = require("../../utils/pvp_handler");
const { teamImage } = require("../../utils/image_helper");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("team")
		.setDescription("Returns a random team")
		.addStringOption(option =>
			option
				.setName("race")
				.setDescription("Does the team have a specific race?")
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
				.setDescription("Does the team have a specific type?")
				.addChoices([
					["Red", "red"],
					["Green", "green"],
					["Blue", "blue"],
					["Dark", "dark"],
					["Light", "light"]
				])
		)
		.addStringOption(option =>
			option
				.setName("grade")
				.setDescription("Does the team have a specific grade?")
				.addChoices([
					["SSR", "ssr"],
					["SR", "sr"],
					["R", "r"],
				])
		)
		.addStringOption(option =>
			option
				.setName("event")
				.setDescription("What event does the team come from?")
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
				.setDescription("Does your team have any affection?")
				.addChoices([
					["Seven Deadly Sins", "sins"],
					["The 10 Commandments", "commandments"],
					["The 7 Catastrophes", "catastrophes"],
					["Holy Knights", "knight"],
					["Archangels", "angels"],
					["None", "none"],
				])
		)
		.addStringOption(option => 
			option
				.setName("banner")
				.setDescription("Is the unit in any banner?")
				.addChoices([
					["General", "general"],
					["Race I", "race one"],
					["Race II", "race two"],
					["Humans", "human"],
					["Ragnarok", "ragnarok"]
				])
		),

	async execute(interaction) {
		let race = interaction.options.getString("race") === null ? null : mapRace(interaction.options.getString("race"));
		let type = interaction.options.getString("type") === null ? null : mapAttribute(interaction.options.getString("type"));
		let grade = interaction.options.getString("grade") === null ? null : mapGrade(interaction.options.getString("grade"));
		let event = interaction.options.getString("event") === null ? null : mapEvent(interaction.options.getString("event"));
		let affection = interaction.options.getString("affection") === null ? null : mapRace(interaction.options.getString("affection"));
		let banners = interaction.options.getString("banner") === null ? null : interaction.options.getString("banner").split(",");

		await interaction.deferReply();
		
		try {
			await interaction.editReply({
				embeds: [new DefaultEmbed().setImage("attachment://unit.jpg")],
				files: [new MessageAttachment(await teamImage(getRandomTeam(race, type, grade, event, affection, null, banners, 1)), "unit.jpg")],
			});
		} catch(e) {
			if(e instanceof RangeError) {
				console.log("Failed " + e);
				return await interaction.editReply({ embeds: [new ErrorEmbed(`Can't find any team`)] });
			} else
				console.log(e)
		}
	},
};
