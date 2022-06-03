import { CommandInteraction, CacheType, MessageAttachment } from "discord.js";
import ICommandExecutor from "../../interfaces/i-command-executor";
import { Event } from "../../models/unit";
import { unitCache } from "../../utilities/cache";
import { ErrorEmbed, sendNavigationMenu } from "../../utils/embeds";
import { unitByVagueName } from "../../utils/units";

export default class FindCExecutor implements ICommandExecutor {
	commandName(): string {
		return "find";
	}
	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		await interaction.deferReply();

		const units = unitByVagueName(
			interaction.options.getString("unit", true),
			interaction.options.getBoolean("custom") ? unitCache.getAll() : unitCache.getAll().filter(u => u.event !== Event.CUSTOM)
		);

		let pointer = 0;

		if (!units) return await interaction.editReply({ embeds: [new ErrorEmbed("No unit found.")] });
		if (units.length === 0 || units[pointer] === undefined || units[pointer] === null) return await interaction.editReply({ embeds: [new ErrorEmbed("No unit found.")] });

		await sendNavigationMenu(
			{
				navigatable: units,
				check: units.length > 1,
			},
			interaction,
			{
				embeds: [units[pointer].infoEmbed()],
			},
			false,
			{
				idleTime: 15000,
				update: async (i, m, c, p) =>
					await i.update({
						embeds: [c.infoEmbed()],
					}),
			}
		);
	}
}
