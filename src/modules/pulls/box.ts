import { CommandInteraction, CacheType, GuildMember, MessageAttachment } from 'discord.js';
import { splitBoxDisplay } from '../../displays/box-display';
import ICommandExecutor from "../../interfaces/i-command-executor";
import { hasBox, getBox } from '../../utils/database_helper';
import { ErrorEmbed, sendNavigationMenu, DefaultEmbed } from '../../utils/embeds';


export default class BoxCExecutor implements ICommandExecutor {
	async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
		let person: GuildMember = interaction.options.getMentionable("for") as GuildMember;

		if (person === undefined || person === null) person = interaction.member as GuildMember;

		if (!hasBox(person)) return await interaction.reply({ embeds: [new ErrorEmbed(`${person.displayName} doesn't have a box yet!`)] });

		let box = getBox(person);
		let boxImages = await splitBoxDisplay(box);

		await sendNavigationMenu(
			{
				navigatable: boxImages,
				check: box.length / 5 > 5,
				previous: "⬆️",
				next: "⬇️",
			},
			interaction,
			{
				embeds: [new DefaultEmbed(`Box of ${person.displayName}`).setImage("attachment://box.png")],
				files: [new MessageAttachment(boxImages[0], "box.png")],
			},
			true,
			{
				idleTime: 15000,
				preCollect: async () => {
					if (box.length / 5 < 5) throw new Error();
				},
				update: async (i, _, content) => {
					await i.deferUpdate();
					await i.editReply({
						files: [new MessageAttachment(content, "box.png")],
					});
				},
			}
		);
	}
}
