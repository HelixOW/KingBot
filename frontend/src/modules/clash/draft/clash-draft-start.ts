import { CommandInteraction, CacheType } from "discord.js";
import draftDataHandler from "../../../implementations/default/draft-data-handler";
import ICommandExecutor from "../../../interfaces/i-command-executor";
import { DefaultEmbed, ErrorEmbed } from "../../../utils/embeds";

export default class ClashDraftStartCExecutor implements ICommandExecutor {
	commandName(): string {
		return "clash draft start";
	}

	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		await interaction.deferReply();

		if (await draftDataHandler.isSeasonStarted())
			return await interaction.editReply({
				embeds: [new ErrorEmbed((await draftDataHandler.getCurrentSeasonName()) + " draft season already started.")],
			});

		await draftDataHandler.startSeason();

		await interaction.editReply({
			embeds: [new DefaultEmbed((await draftDataHandler.getCurrentSeasonName()) + " draft season").setDescription("Successfully started!")],
		});
	}
}
