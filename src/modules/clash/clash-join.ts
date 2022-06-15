import { CommandInteraction, CacheType, GuildMember } from "discord.js";
import draftDataHandler from "../../implementations/default/draft-data-handler";
import ICommandExecutor from "../../interfaces/i-command-executor";
import { DefaultEmbed, ErrorEmbed } from "../../utils/embeds";

export default class ClashJoinCExecutor implements ICommandExecutor {
	commandName(): string {
		return "clash join";
	}

	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		await interaction.deferReply();

		if (await draftDataHandler.isPlayerSigned(interaction.member as GuildMember))
			return await interaction.editReply({
				embeds: [new ErrorEmbed(`Already signed up for ${await draftDataHandler.getCurrentSeasonName()}`)],
			});

		try {
			await draftDataHandler.signupPlayer(interaction.member as GuildMember);
		} catch (e) {
			console.log(e);
		}

		await interaction.editReply({
			embeds: [new DefaultEmbed(`Signed up for ${await draftDataHandler.getCurrentSeasonName()}`)],
		});
	}
}
