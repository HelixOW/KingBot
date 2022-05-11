import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageActionRow, MessageAttachment, MessageComponentInteraction, MessageSelectMenu, WebhookEditMessageOptions } from 'discord.js';
import { scanForNewUnits } from "../utils/gcdatabase";
import { DefaultEmbed, awaitSelection } from '../utils/embeds';
import { readUnitsFromDatabase, registerNewUnit } from "../utils/database_helper";

export const data = new SlashCommandBuilder().setName("admin").setDescription("Well well well").setDefaultPermission(false);

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();

	const generator = scanForNewUnits();

	for await (let unit of generator) {
        let msg: Message = await interaction.editReply({
            embeds: [new DefaultEmbed(unit.name).setColor(unit.type.toDiscordColor()).setThumbnail(`attachment://${unit.id}.png`).setDescription("Select a Event")],
            files: [new MessageAttachment(unit.icon.toBuffer(), `${unit.id}.png`)],
            components: [new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId("event")
                    .setPlaceholder("Select Event")
                    .addOptions([
                        { label: "Base Game", value: "gc" },
                        { label: "Slime", value: "slime" },
                        { label: "Attack on Titan", value: "aot" },
                        { label: "King of Fighter", value: "kof" },
                        { label: "New Year", value: "newyear" },
                        { label: "Halloween", value: "halloween" },
                        { label: "Festival", value: "festival" },
                        { label: "Valentine", value: "valentine" },
                        { label: "Re: Zero", value: "rezero" },
                        { label: "Stranger Things", value: "stranger" },
                        { label: "Ragnarok", value: "ragnarok" },
                    ])
                )
            ]
        } as WebhookEditMessageOptions) as Message

        const event = await awaitSelection(
            msg,
            (i: MessageComponentInteraction) => i.customId === "event" && i.message.id === msg.id,
           async i => await i.update({})
        )

        msg = await interaction.editReply({
            embeds: [new DefaultEmbed(unit.name).setColor(unit.type.toDiscordColor()).setThumbnail(`attachment://${unit.id}.png`).setDescription("Select a Affection")],
            components: [
                new MessageActionRow().addComponents(
                    new MessageSelectMenu()
                        .setCustomId("affection")
                        .setPlaceholder("Select Affection")
                        .addOptions([
                            { label: "Sins", value: "sins" },
                            { label: "Commandments", value: "commandments" },
                            { label: "Holy Knights", value: "holyknights" },
                            { label: "Catastrophes", value: "catastrophes" },
                            { label: "Angels", value: "archangels" },
                            { label: "None", value: "none" },
                        ])
                )
            ]
        } as WebhookEditMessageOptions) as Message

        const affection = await awaitSelection(
            msg,
            (i: MessageComponentInteraction) => i.customId === "affection" && i.message.id === msg.id,
            async i => await i.update({})
        )

        /*msg = await interaction.editReply({
            components: [],
            files: [],
            embeds: [new DefaultEmbed(unit.name).setColor(unit.type.toDiscordColor()).setThumbnail(`attachment://${unit.id}.png`).setDescription("Please note the banners")]
        }) as Message

        const bannerFilter = response => true
        const bannerCollector = interaction.channel.createMessageCollector({filter: bannerFilter, max: 1})

        const banners = await new Promise<String>(res => {
            bannerCollector.on("collect", response => {
                console.log(response.content)

                res(response.content)
            });
        })*/

        await registerNewUnit(unit, event, affection)
        await interaction.editReply({
            embeds: [new DefaultEmbed("Success").setColor("GREEN").setDescription(`Registered ${unit.name}`)],
            components: [],
            files: []
        })
	}

    await readUnitsFromDatabase()
    await interaction.editReply({
        embeds: [new DefaultEmbed("Success").setColor("GREEN").setDescription(`Registered all new Units`)],
        components: [],
        files: []
    })
}
