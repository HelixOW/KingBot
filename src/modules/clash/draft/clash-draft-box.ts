import { CommandInteraction, CacheType, GuildMember } from "discord.js";
import draftDataHandler from "../../../implementations/default/draft-data-handler";
import ICommandExecutor from "../../../interfaces/i-command-executor";
import { DefaultEmbed, ErrorEmbed } from "../../../utils/embeds";

export default class ClashDraftBoxCExecutor implements ICommandExecutor {
	commandName(): string {
		return "clash draft box";
	}

	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		await interaction.deferReply();

		if (await draftDataHandler.isSeasonStarted())
			return await interaction.editReply({
				embeds: [new ErrorEmbed(`${await draftDataHandler.getCurrentSeasonName()} draft season hasn't started yet!`)],
			});

		const p: GuildMember = (
			interaction.options.getMentionable("of")
				? interaction.options.getMentionable("of") instanceof GuildMember
					? interaction.options.getMentionable("of")
					: interaction.member
				: interaction.member
		) as GuildMember;

		if (!(await draftDataHandler.isPlayerSigned(p)))
			return await interaction.editReply({
				embeds: [new ErrorEmbed(`${p.displayName} is not part of the ${await draftDataHandler.getCurrentSeasonName()} draft season.`)],
			});

		const units = await draftDataHandler.getUnits(p);

		await interaction.editReply({
			embeds: [new DefaultEmbed((await draftDataHandler.getCurrentSeasonName()) + " draft season").setDescription("Successfully started!")],
		});
	}
}
