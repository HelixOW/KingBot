import { SlashCommandBuilder } from "@discordjs/builders";
import { bannerByName } from "../../utils/banners";
import { CacheType, CommandInteraction, GuildMember } from "discord.js";
import { ICommand } from "../../interfaces/ICommand";
import Banner from '../../models/banner';
import { multi } from "../../utils/handlers/summonsHandler";

export default class MultiCommand implements ICommand {
	get data(): any {
		return new SlashCommandBuilder()
			.setName("multi")
			.setDescription("Do a multi on any current banner.")
			.addStringOption(option => option.setName("banner").setDescription("Which banner do you want to pull from?"))
			.addMentionableOption(option => option.setName("for").setDescription("Who do you want to do a multi for?"))
			.addIntegerOption(option => option.setName("amount").setDescription("How many multis do you want to do?"));
	}

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

		if (amount < 0) return multi(interaction, banner, true);

		return multi(interaction, banner, false, amount, person);
	}
}
