import { CommandInteraction, CacheType, MessageAttachment } from "discord.js";
import ICommandExecutor from "../../interfaces/i-command-executor";
import { Race, Type, Grade, Affection, Event } from "../../models/unit";
import { DefaultEmbed, ErrorEmbed } from "../../utils/embeds";
import { getRandomUnit } from "../../utils/handlers/pvp-handler";

export default class UnitCExecutor implements ICommandExecutor {
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
