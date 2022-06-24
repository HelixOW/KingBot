import { CommandInteraction, CacheType, GuildMember, EmbedFieldData } from "discord.js";
import draftDataHandler from "../../implementations/default/draft-data-handler";
import ICommandExecutor from "../../interfaces/i-command-executor";
import { DefaultEmbed } from "../../utils/embeds";

export default class ClashInfoCExecutor implements ICommandExecutor {
	commandName(): string {
		return "clash info";
	}

	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		await interaction.deferReply();

		await interaction.editReply({
			embeds: [
				new DefaultEmbed(await draftDataHandler.getCurrentSeasonName()).addFields(
					(
						await draftDataHandler.getPlayers(interaction.guild)
					).map((player, i) => {
						return {
							value: `${player.user.username}#${player.user.discriminator}`,
							name: `${i}. ${player.displayName}`,
						};
					})
				),
			],
		});
	}
}
