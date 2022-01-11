const {SlashCommandBuilder} = require("@discordjs/builders")
const {MessageActionRow, MessageButton, MessageSelectMenu} = require("discord.js")
const {ALL_BANNER_LIST, banner_by_name} = require("../../utils/banners_helper")
const {DefaultEmbed, sendMenu} = require("../../utils/embeds")
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
        let pointer = 0
        let state = "summon"
        await sendMenu(
            interaction,
            {
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
            },
            true,
            [{
                customIds: ["prev", "next"],
                idleTime: -1,
                preCollect: async () => {},
                onCollect: async (i, message) => {
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
                    await i.update({
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
                },
                postCollect: async (collected, reason) => await interaction.editReply({components: []})
            },
            {
                customIds: ["action"],
                idleTime: -1,
                preCollect: async () => {},
                onCollect: async (i, message, collector) => {
                    if(!i.isSelectMenu()) return
        
                    const action = i.values[0]
                    const banner = banner_by_name(action.slice(action.indexOf(".") + 1))
        
                    await i.message.removeAttachments()
                    await i.update({components: []})

                    collector.stop()
        
                    switch (action.slice(0, action.indexOf("."))) {
                        case "single":
                            await single(interaction, banner, undefined, undefined, false)
                            break
                        case "multi":
                            await multi(interaction, banner, undefined, undefined, undefined, false)
                            break
                        case "whale":
                            await whale(interaction, banner, undefined, undefined, false)
                            break
                        case "rotation":
                            await multi(interaction, banner, true, undefined, undefined, false)
                            break
                        case "infos":
                            state = "infos"
                            await infos(interaction, banner, false)
                            break
                    }
                },
                postCollect: async (collected, reason) => await interaction.editReply({components: []})
            }]
        )
    }
}