import { CommandInteraction, CacheType, MessageAttachment } from "discord.js";
import ICommandExecutor from "../../interfaces/i-command-executor";
import { Event } from "../../models/unit";
import { unitCache } from "../../utilities/cache";
import { sendNavigationMenu } from "../../utils/embeds";
import { unitByVagueName } from "../../utils/units";

export default class FindCExecutor implements ICommandExecutor {
	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		await interaction.deferReply();

		const units = unitByVagueName(
			interaction.options.getString("unit", true),
			interaction.options.getBoolean("custom") ? await unitCache.getAll() : (await unitCache.getAll()).filter(u => u.event !== Event.CUSTOM)
		);

		let pointer = 0;

		if (!units) return;
		if (units[pointer] === undefined || units[pointer] === null) return;

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
