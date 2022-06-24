import { CommandInteraction, CacheType } from "discord.js";
import unitDataHandler from "../../implementations/default/unit-data-handler";
import ICommandExecutor from "../../interfaces/i-command-executor";
import { DefaultEmbed } from "../../utils/embeds";

export default class AdminReloadCExecutor implements ICommandExecutor {
	commandName(): string {
		return "admin reload";
	}

	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		await interaction.deferReply({ ephemeral: true });

		await unitDataHandler.readUnits();

		await interaction.editReply({
			embeds: [new DefaultEmbed("Reloaded units!")],
		});
	}
}
