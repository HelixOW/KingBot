import { CommandInteraction, CacheType, MessageActionRow, MessageButton, MessageSelectMenu } from "discord.js";
import ICommandExecutor from "../../interfaces/i-command-executor";
import Banner from "../../models/banner";
import { allBannerList, bannerByName } from "../../utils/banners";
import { sendMenu, DefaultEmbed } from "../../utils/embeds";
import { infos, multi, single, whale } from "../../utils/handlers/summons-handler";

export default class SummonCExecutor implements ICommandExecutor {
	static registerOptions(banner: Banner) {
		if (banner.shaftable)
			return [
				{ label: "Single", description: "Do a single on " + banner.prettyName, value: "single." + banner.uniqueName },
				{ label: "Multi", description: "Do a multi on " + banner.prettyName, value: "multi." + banner.uniqueName },
				{ label: "Rotation", description: "Do a rotation on " + banner.prettyName, value: "rotation." + banner.uniqueName },
				{ label: "Whale", description: "Consecutive Multis until a SSR is drafted", value: "whale." + banner.uniqueName },
				{ label: "Units", description: "Show all Units on " + banner.prettyName, value: "infos." + banner.uniqueName },
			];
		else
			return [
				{ label: "Single", description: "Do a single on " + banner.prettyName, value: "single." + banner.uniqueName },
				{ label: "Multi", description: "Do a multi on " + banner.prettyName, value: "multi." + banner.uniqueName },
				{ label: "Rotation", description: "Do a rotation on " + banner.prettyName, value: "rotation." + banner.uniqueName },
				{ label: "Units", description: "Show all Units on " + banner.prettyName, value: "infos." + banner.uniqueName },
			];
	}

	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		let pointer = 0;
		let state = "summon";

		await sendMenu(
			interaction,
			{
				embeds: [new DefaultEmbed().setTitle(allBannerList.first().prettyName).setImage(allBannerList.first().background)],
				components: [
					new MessageActionRow().addComponents(
						new MessageSelectMenu().setCustomId("action").setPlaceholder("Nothing Selected").addOptions(SummonCExecutor.registerOptions(allBannerList.first()))
					),
					new MessageActionRow().addComponents(
						new MessageButton().setCustomId("prev").setStyle("PRIMARY").setEmoji("⬅️"),
						new MessageButton().setCustomId("next").setStyle("PRIMARY").setEmoji("➡️")
					),
				],
			},
			true,
			[
				{
					customIds: ["prev", "next"],
					idleTime: -1,
					preCollect: async () => {},
					onCollect: async (i, message) => {
						if (!i.isButton() || state === "infos") return;

						switch (i.customId) {
							case "prev":
								pointer -= 1;
								if (pointer < 0) pointer = allBannerList.size - 1;
								break;
							case "next":
								pointer += 1;
								if (pointer === allBannerList.size) pointer = 0;
								break;
						}

						await message.removeAttachments();
						await i.update({
							embeds: [new DefaultEmbed().setTitle(allBannerList.at(pointer).prettyName).setImage(allBannerList.at(pointer).background)],
							components: [
								new MessageActionRow().addComponents(
									new MessageSelectMenu()
										.setCustomId("action")
										.setPlaceholder("Nothing Selected")
										.addOptions(SummonCExecutor.registerOptions(allBannerList.at(pointer)))
								),
								new MessageActionRow().addComponents(
									new MessageButton().setCustomId("prev").setStyle("PRIMARY").setEmoji("⬅️"),
									new MessageButton().setCustomId("next").setStyle("PRIMARY").setEmoji("➡️")
								),
							],
						});
					},
					postCollect: async (collected, reason) => await interaction.editReply({ components: [] }),
				},
				{
					customIds: ["action"],
					idleTime: -1,
					preCollect: async () => {},
					onCollect: async (i, message, collector) => {
						if (!i.isSelectMenu()) return;

						const action = i.values[0];
						const banner = bannerByName(action.slice(action.indexOf(".") + 1));

						await message.removeAttachments();
						await i.update({ components: [] });

						collector.stop();

						switch (action.slice(0, action.indexOf("."))) {
							case "single":
								await single(interaction, banner, undefined, undefined, false);
								break;
							case "multi":
								await multi(interaction, banner, undefined, undefined, undefined, false);
								break;
							case "whale":
								await whale(interaction, banner, undefined, undefined, false);
								break;
							case "rotation":
								await multi(interaction, banner, true, undefined, undefined, false);
								break;
							case "infos":
								state = "infos";
								await infos(interaction, banner, false);
								break;
						}
					},
					postCollect: async (collected, reason) => await interaction.editReply({ components: [] }),
				},
			]
		);
	}
}
