const {SlashCommandBuilder} = require("@discordjs/builders")
const { loadImage } = require("canvas")
const {MessageActionRow, MessageButton, MessageSelectMenu, MessageAttachment} = require("discord.js")
const {ALL_BANNER_LIST, banner_by_name} = require("../../utils/banners_helper")
const {DefaultEmbed} = require("../../utils/embeds")
const {single, multi, infos, whale} = require("../../utils/summons_handler")

function registerOptions(banner) {
    if(banner.shaftable)
        return [
            {label: "Single", description: "Do a single on " + banner.pretty_name,
                value: "single." + banner.unique_name},
            {label: "Multi", description: "Do a multi on " + banner.pretty_name,
                value: "multi." + banner.unique_name},
            {label: "Rotation", description: "Do a rotation on " + banner.pretty_name,
                value: "rotation." + banner.unique_name},
            {label: "Whale", description: "Consecutive Multis until a SSR is drafted",
                value: "whale." + banner.unique_name},
            {label: "Units", description: "Show all Units on " + banner.pretty_name,
                value: "infos." + banner.unique_name}
        ]
    else
        return [
            {label: "Single", description: "Do a single on " + banner.pretty_name,
                value: "single." + banner.unique_name},
            {label: "Multi", description: "Do a multi on " + banner.pretty_name,
                value: "multi." + banner.unique_name},
            {label: "Rotation", description: "Do a rotation on " + banner.pretty_name,
                value: "rotation." + banner.unique_name},
            {label: "Units", description: "Show all Units on " + banner.pretty_name,
                value: "infos." + banner.unique_name}
        ]
}

module.exports = {
    data:  new SlashCommandBuilder()
        .setName("summon")
        .setDescription("Show a summon menu"),

    async execute(interaction) {
        await interaction.deferReply()
        const msg = await interaction.editReply({
            embeds: [new DefaultEmbed()
                .setTitle(ALL_BANNER_LIST[0].pretty_name)
                .setImage(ALL_BANNER_LIST[0].background)
            ],
            components: [
                new MessageActionRow().addComponents(
                    new MessageSelectMenu()
                        .setCustomId("action")
                        .setPlaceholder("Nothing Selected")
                        .addOptions(registerOptions(ALL_BANNER_LIST[0]))
                ),
                new MessageActionRow().addComponents(
                    new MessageButton().setCustomId("prev").setStyle("PRIMARY").setEmoji("⬅️"),
                    new MessageButton().setCustomId("next").setStyle("PRIMARY").setEmoji("➡️")
                )
            ]
        })

        let pointer = 0
        let state = "summon"
        const filter = i => (i.customId === 'prev' || i.customId === 'next') && i.user.id === interaction.user.id
        const actionFilter = i => i.customId === 'action' && i.member.id === interaction.member.id
        const collector = interaction.channel.createMessageComponentCollector({filter, message: msg})
        const actionCollector = interaction.channel.createMessageComponentCollector({actionFilter, message: msg})

        actionCollector.on('collect', async i => {
            if(!i.isSelectMenu()) return

            const action = i.values[0]
            const banner = banner_by_name(action.slice(action.indexOf(".") + 1))

            await i.message.removeAttachments()
            await interaction.editReply({components: []})

            switch (action.slice(0, action.indexOf("."))) {
                case "single":
                    await single(interaction, banner, undefined, undefined, false)
                    break
                case "multi":
                    await multi(interaction, banner, undefined, undefined, undefined, false)
                    break
                case "whale":
                    await whale(interaction, banner, undefined, false)
                    break
                case "rotation":
                    await multi(interaction, banner, true, undefined, undefined, false)
                    break
                case "infos":
                    state = "infos"
                    await infos(interaction, banner, msg, false)
                    break
            }
        })

        collector.on('collect', async i => {
            if (!i.isButton() || state === "infos") return
            
            switch (i.customId) {
                case "prev":
                    pointer -= 1
                    if (pointer < 0) pointer = ALL_BANNER_LIST.length - 1
                    break
                case "next":
                    pointer += 1
                    if (pointer === ALL_BANNER_LIST.length) pointer = 0
                    break
            }

            await i.message.removeAttachments()

            await i.deferUpdate()
            await i.editReply({
                embeds: [new DefaultEmbed()
                    .setTitle(ALL_BANNER_LIST[pointer].pretty_name)
                    .setImage(ALL_BANNER_LIST[pointer].background)
                ],
                components: [
                    new MessageActionRow().addComponents(
                        new MessageSelectMenu()
                            .setCustomId("action")
                            .setPlaceholder("Nothing Selected")
                            .addOptions(registerOptions(ALL_BANNER_LIST[pointer]))
                    ),
                    new MessageActionRow().addComponents(
                        new MessageButton().setCustomId("prev").setStyle("PRIMARY").setEmoji("⬅️"),
                        new MessageButton().setCustomId("next").setStyle("PRIMARY").setEmoji("➡️")
                    )
                ]
            })
        })
    }
}