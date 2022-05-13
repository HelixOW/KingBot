import { SlashCommandBuilder } from "@discordjs/builders";
import { CacheType, CommandInteraction, MessageAttachment } from "discord.js";
import { unitByVagueName, unitList, Event } from "../utils/units";
import { sendNavigationMenu } from "../utils/embeds";
import { ICommand } from "../utilities/ICommand";

export default class FindCommand implements ICommand {
	get data(): any {
		return new SlashCommandBuilder()
			.setName("find")
			.setDescription("Check if unit is present.")
			.addStringOption(option => option.setName("unit").setDescription("What unit do you want to find? (Name or ID)").setRequired(true))
			.addBooleanOption(option => option.setName("custom").setDescription("Do you want to include custom units?"));
	}

	async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
		const unit = [
			...unitByVagueName(
				interaction.options.getString("unit", true),
				interaction.options.getBoolean("custom") ? unitList : unitList.filter(u => u.event !== Event.CUSTOM)
			).values(),
		];
		let pointer = 0;

		if (unit === undefined || unit === null) return;
		if (unit[pointer] === undefined || unit[pointer] === null) return;

		await sendNavigationMenu(
			{
				navigatable: unit,
				check: unit.length > 1,
			},
			interaction,
			{
				embeds: [unit[pointer].info_embed()],
				files: [new MessageAttachment(unit[pointer].iconPath)],
			},
			true,
			{
				idleTime: 15000,
				update: async (i, m, c, p) =>
					await i.update({
						embeds: [c.info_embed()],
						files: [new MessageAttachment(c.iconPath)],
					}),
			}
		);
	}
}
