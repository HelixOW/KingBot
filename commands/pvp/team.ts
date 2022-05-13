import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageAttachment, MessageActionRow, MessageButton, CommandInteraction, CacheType } from "discord.js";
import { DefaultEmbed, ErrorEmbed, sendMenu } from "../../utils/embeds";
import { Race, Type, Grade, Event, Affection } from "../../utils/units";
import { getRandomTeam, getRandomUnit, replaceDuplicates } from "../../utils/pvp_handler";
import { teamDisplay } from "../../utils/display";
import { chunk } from "../../utils/general";
import { ICommand } from "../../utilities/ICommand";

export default class TeamCommand implements ICommand {
	get data(): any {
		return new SlashCommandBuilder()
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
						["Light", "light"],
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
		let banners = interaction.options.getString("banner") === null ? null : interaction.options.getString("banner").split(",");

		let replaced = [];

		try {
			let team = getRandomTeam(race, type, grade, event, affection, null, banners, replaced);

			await sendMenu(
				interaction,
				{
					embeds: [new DefaultEmbed().setImage("attachment://unit.jpg")],
					files: [new MessageAttachment(await teamDisplay(team), "unit.jpg")],
					components: [
						new MessageActionRow().addComponents(
							new MessageButton().setCustomId("1").setStyle("PRIMARY").setEmoji("1️⃣"),
							new MessageButton().setCustomId("2").setStyle("PRIMARY").setEmoji("2️⃣"),
							new MessageButton().setCustomId("3").setStyle("PRIMARY").setEmoji("3️⃣"),
							new MessageButton().setCustomId("4").setStyle("PRIMARY").setEmoji("4️⃣")
						),
					],
				},
				true,
				[
					{
						customIds: ["1", "2", "3", "4"],
						idleTime: 30000,
						onCollect: async (i, m) => {
							if (!i.isButton()) return;
							await i.deferUpdate();
							await m.removeAttachments();
							let replace = -1;

							switch (i.customId) {
								case "1":
									replace = 0;
									break;
								case "2":
									replace = 1;
									break;
								case "3":
									replace = 2;
									break;
								case "4":
									replace = 3;
									break;
							}

							replaced.push(team[replace]);
							team[replace] = getRandomUnit(race, type, grade, event, affection, null, banners, replaced);
							const replaceFields = replaced.map(r => {
								return {
									name: `${r.grade.toEmoji()} ${r.type.toEmoji()} `,
									value: `\`${r.name}\``,
									inline: true,
								};
							});

							const replaceFieldArray = chunk(replaceFields, 25);
							let embeds = [new DefaultEmbed().setImage("attachment://unit.jpg")];

							for (let replaceFieldItem of replaceFieldArray) embeds.push(new DefaultEmbed("Replaced Units so far").addFields(replaceFieldItem));
							try {
								replaceDuplicates(race, type, grade, event, affection, null, banners, team, replaced);
							} catch (e) {
								if (e instanceof RangeError) {
									await i.editReply({ embeds: [new ErrorEmbed(`Can't find any team`)] });
									return;
								}
								console.log(e);
							}

							await i.editReply({
								files: [new MessageAttachment(await teamDisplay(team), "unit.jpg")],
								embeds: embeds,
							});
						},
						postCollect: async (_, r) => await interaction.editReply({ components: [] }),
					},
				]
			);
		} catch (e) {
			if (e instanceof RangeError) {
				return await interaction.editReply({ embeds: [new ErrorEmbed(`Can't find any team`)] });
			} else console.log(e);
		}
	}
}
