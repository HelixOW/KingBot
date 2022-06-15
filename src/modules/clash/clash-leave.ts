import { CommandInteraction, CacheType, GuildMember } from "discord.js";
import draftDataHandler from "../../implementations/default/draft-data-handler";
import ICommandExecutor from "../../interfaces/i-command-executor";
import { DefaultEmbed, ErrorEmbed } from "../../utils/embeds";

export default class ClashLeaveCExecutor implements ICommandExecutor {
	commandName(): string {
		return "clash leave";
	}

	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		await interaction.deferReply();

		if (!(await draftDataHandler.isPlayerSigned(interaction.member as GuildMember)))
			return await interaction.editReply({
				embeds: [new ErrorEmbed(`Not signed up for ${await draftDataHandler.getCurrentSeasonName()}`)],
			});

		try {
			await draftDataHandler.quitPlayer(interaction.member as GuildMember);
		} catch (e) {
			console.log(e);
		}

		await interaction.editReply({
			embeds: [new DefaultEmbed(`Left draft: ${await draftDataHandler.getCurrentSeasonName()}`)],
		});
	}
}
