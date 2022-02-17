import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageAttachment, CommandInteraction, GuildMember } from 'discord.js';
import { DefaultEmbed, ErrorEmbed, sendNavigationMenu } from "../../utils/embeds";
import { splitBoxDisplay } from "../../utils/display";
import { getBox, hasBox } from "../../utils/database_helper";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("box")
        .setDescription("Shows the box.")
        .addMentionableOption(option =>
            option.setName("for")
                .setDescription("Who do you want to do a single for?")),

    async execute(interaction: CommandInteraction) {
        let person: GuildMember = interaction.options.getMentionable("for") as GuildMember

        if(person === undefined || person === null)
            person = interaction.member as GuildMember

        if(!hasBox(person))
            return await interaction.reply({embeds: [
                new ErrorEmbed(`${person.displayName} doesn't have a box yet!`)
            ]})

        let box = getBox(person)
        let boxImages = await splitBoxDisplay(box)

        await sendNavigationMenu(
            {
                navigatable: boxImages,
                check: box.length / 5 > 5,
                previous: "⬆️",
                next: "⬇️"
            },
            interaction,
            {
                embeds: [new DefaultEmbed(`Box of ${person.displayName}`).setImage("attachment://box.png")],
                files: [new MessageAttachment(boxImages[0], "box.png")]
            },
            true,
            {
                idleTime: 15000,
                preCollect: async () => { if(box.length / 5 < 5) throw new Error() },
                update: async (i, _, content) => {
                    await i.deferUpdate()
                    await i.editReply({
                        files: [new MessageAttachment(content, "box.png")],
                    })
                }
            }
        )
    },
}