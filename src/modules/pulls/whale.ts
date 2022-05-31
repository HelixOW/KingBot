import { CommandInteraction, CacheType, GuildMember, MessageActionRow, MessageAttachment, MessageButton } from "discord.js";
import ICommandExecutor from "../../interfaces/i-command-executor";
import Banner from "../../models/banner";
import { bannerByName, allBannerList, findBannerContaining, findBannerContainingAny } from "../../utils/banners";
import { ErrorEmbed, sendMenu, DefaultEmbed } from "../../utils/embeds";
import { whale } from "../../utils/handlers/summons-handler";
import { unitByVagueName } from "../../utils/units";
import { unitCache } from "../../utilities/cache";

export default class WhaleCExecutor implements ICommandExecutor {
	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		let banner: Banner,
			unit: string = interaction.options.getString("unit"),
			person: GuildMember = interaction.options.getMentionable("for") as GuildMember;

		if (interaction.options.getString("banner") === null) banner = bannerByName("general");
		else {
			banner = bannerByName(interaction.options.getString("banner"));

			if (banner === undefined) return interaction.reply({ embeds: [new ErrorEmbed(`Can't find the \`${interaction.options.getString("banner")}\` banner.`)] });
		}

		if (person === undefined || person === null) person = interaction.member as GuildMember;

		if (unit === null) return whale(interaction, banner, undefined, person);

		const units = unitByVagueName(unit, await unitCache.getAll()).filter(u => allBannerList.some(b => b.hasUnit([u])));

		if (units.length === 0) return interaction.reply({ embeds: [new ErrorEmbed(`Can't find any Unit matching the name \`${interaction.options.getString("unit")}\`.`)] });

		if (units.length === 1) {
			if (!banner.units.includes(units[0])) {
				banner = findBannerContaining(units[0]);
				if (banner === undefined) return interaction.reply({ embeds: [new ErrorEmbed(`Can't find any banner containing \`${units[0].name}\`.`)], components: [] });
			}

			return whale(interaction, banner, units[0], person);
		}

		if (!banner.hasUnit([...units.values()])) {
			banner = findBannerContainingAny([...units.values()]);
			if (banner === undefined)
				return interaction.reply({ embeds: [new ErrorEmbed(`Can't find any banner containing \`${interaction.options.getString("unit")}\`.`)], components: [] });
		}

		let pointer: number = 0;

		await sendMenu(
			interaction,
			{
				content: "Which unit do you want to pull?",
				files: [new MessageAttachment((await units[0].refreshIcon()).toBuffer(), "unit.png")],
				embeds: [new DefaultEmbed().setTitle(units[0].name).setImage("attachment://unit.png")],
				components: [
					new MessageActionRow().addComponents(
						new MessageButton().setCustomId("prev").setStyle("PRIMARY").setEmoji("⬅️"),
						new MessageButton().setCustomId("pick").setStyle("SUCCESS").setEmoji("✅"),
						new MessageButton().setCustomId("next").setStyle("PRIMARY").setEmoji("➡️")
					),
				],
			},
			true,
			[
				{
					customIds: ["prev", "next"],
					idleTime: 15000,
					onCollect: async (i, m) => {
						if (!i.isButton()) return;

						if (i.customId === "prev") {
							pointer -= 1;
							if (pointer < 0) pointer = units.length - 1;
						} else if (i.customId === "next") {
							pointer += 1;
							if (pointer === units.length) pointer = 0;
						}

						await m.removeAttachments();

						if (units.at(pointer) === undefined || units.at(pointer) === null) return;
						await i.deferUpdate();
						await i.editReply({
							files: [new MessageAttachment((await units.at(pointer).refreshIcon()).toBuffer(), "unit.png")],
							embeds: [new DefaultEmbed().setTitle(units.at(pointer).name).setImage("attachment://unit.png")],
						});
					},
					postCollect: async (reason, _) => await interaction.editReply({ components: [] }),
				},
				{
					customIds: ["pick"],
					idleTime: 15000,
					onCollect: async (i, m) => {
						if (!i.isButton()) return;
						await m.removeAttachments();

						if (!banner.units.includes(units.at(pointer))) {
							banner = findBannerContaining(units.at(pointer));
							if (banner === undefined) {
								interaction.editReply({ embeds: [new ErrorEmbed(`Can't find any banner containing \`${units.at(pointer).name}\`.`)], components: [] });
								return;
							}
						}
						await i.deferUpdate();
						whale(interaction, banner, units.at(pointer), person, false);
					},
					postCollect: async (reason, _) => await interaction.editReply({ components: [] }),
				},
			]
		);
	}
}
