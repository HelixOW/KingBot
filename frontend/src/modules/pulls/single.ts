import { CommandInteraction, CacheType, GuildMember } from "discord.js";
import ICommandExecutor from "../../interfaces/i-command-executor";
import Banner from "../../models/banner";
import { bannerByName } from "../../utils/banners";
import { single } from "../../utils/handlers/summons-handler";

export default class SingleCExecutor implements ICommandExecutor {
	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		let banner: Banner,
			amount: number = interaction.options.getInteger("amount"),
			person: GuildMember = interaction.options.getMentionable("for") as GuildMember;

		if (interaction.options.getString("banner") === null) banner = bannerByName("general");
		else {
			banner = bannerByName(interaction.options.getString("banner"));

			if (banner === undefined) return interaction.reply({ content: `Can't find the \`${interaction.options.getString("banner")}\` banner.` });
		}

		if (amount === null) amount = 1;

		if (person === undefined || person === null) person = interaction.member as GuildMember;

		if (amount < 0) return single(interaction, banner, 1, person);

		return single(interaction, banner, amount, person);
	}
}
