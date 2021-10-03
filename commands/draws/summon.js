const {SlashCommandBuilder} = require("@discordjs/builders")
const {MessageAttachment, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu, SelectMenuInteraction} = require("discord.js")
const {ALL_BANNER_LIST, banner_by_name} = require("../../utils/banners_helper")
const {banner_multi_image} = require("../../utils/image_helper");


module.exports = {
    data:  new SlashCommandBuilder()
        .setName("summon")
        .setDescription("Show a summon menu"),

    async execute(interaction) {
        await interaction.deferReply()
        const msg = await interaction.editReply({
            embeds: [new MessageEmbed()
                .setTitle(ALL_BANNER_LIST[0].pretty_name)
                .setColor("#008080")
                .setImage(ALL_BANNER_LIST[0].background)
                .setFooter("© Heⅼіх Sama#0578",
                    "https://cdn.discordapp.com/avatars/456276194581676062/dda3dc4e7a35fbe4afef3488054363cc.webp?size=256")
            ],
            components: [
                new MessageActionRow().addComponents(
                    new MessageSelectMenu()
                        .setCustomId("action")
                        .setPlaceholder("Nothing Selected")
                        .addOptions([
                            {label: "Single", description: "Do a single on " + ALL_BANNER_LIST[0].pretty_name,
                                value: "single." + ALL_BANNER_LIST[0].unique_name},
                            {label: "Multi", description: "Do a multi on " + ALL_BANNER_LIST[0].pretty_name,
                                value: "multi." + ALL_BANNER_LIST[0].unique_name},
                            {label: "Whale", description: "Consecutive Multis until a SSR is drafted",
                                value: "whale." + ALL_BANNER_LIST[0].unique_name},
                            {label: "Units", description: "Show all Units on " + ALL_BANNER_LIST[0].pretty_name,
                                value: "infos." + ALL_BANNER_LIST[0].unique_name}
                        ])
                ),
                new MessageActionRow().addComponents(
                    new MessageButton().setCustomId("prev").setStyle("PRIMARY").setEmoji("⬅️"),
                    new MessageButton().setCustomId("next").setStyle("PRIMARY").setEmoji("➡️")
                )
            ]
        })

        let pointer = 0
        const filter = i => (i.customId === 'prev' || i.customId === 'next') && i.user.id === interaction.user.id
        const actionFilter = i => i.customId === 'action' && i.member.id === interaction.member.id
        const collector = interaction.channel.createMessageComponentCollector({filter, message: msg})
        const actionCollector = interaction.channel.createMessageComponentCollector({actionFilter, message: msg})

        const comps = [
            new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId("action")
                    .setPlaceholder("Nothing Selected")
                    .addOptions([
                        {label: "Single", description: "Do a single on " + ALL_BANNER_LIST[pointer].pretty_name,
                            value: "single." + ALL_BANNER_LIST[pointer].unique_name},
                        {label: "Multi", description: "Do a multi on " + ALL_BANNER_LIST[pointer].pretty_name,
                            value: "multi." + ALL_BANNER_LIST[pointer].unique_name},
                        {label: "Whale", description: "Consecutive Multis until a SSR is drafted",
                            value: "whale." + ALL_BANNER_LIST[pointer].unique_name},
                        {label: "Units", description: "Show all Units on " + ALL_BANNER_LIST[pointer].pretty_name,
                            value: "infos." + ALL_BANNER_LIST[pointer].unique_name}
                    ])
            ),
            new MessageActionRow().addComponents(
                new MessageButton().setCustomId("prev").setStyle("PRIMARY").setEmoji("⬅️"),
                new MessageButton().setCustomId("next").setStyle("PRIMARY").setEmoji("➡️")
            )
        ]

        actionCollector.on('collect', async i => {
            if(!i.isSelectMenu()) return

            const action = i.values[0]
            const banner = banner_by_name(action.slice(action.indexOf(".") + 1))

            await interaction.editReply({components: []})

            switch (action.slice(0, action.indexOf("."))) {
                case "single":
                    await interaction.editReply({
                        files: [new MessageAttachment((await (await banner.unit_by_chance()).refresh_icon()).toBuffer(), "unit.png")],
                        embeds: [new MessageEmbed()
                            .setTitle(banner.pretty_name + " (1x summon)")
                            .setColor("#008080")
                            .setImage("attachment://unit.png")
                            .setFooter("© Heⅼіх Sama#0578",
                                "https://cdn.discordapp.com/avatars/456276194581676062/dda3dc4e7a35fbe4afef3488054363cc.webp?size=256")
                        ],
                    })
                    break
                case "multi":
                    const multi = []
                    for(let unit = 0; unit < banner.banner_type; unit++)
                        multi.push(await banner.unit_by_chance())

                    await interaction.editReply({
                        files: [new MessageAttachment(await banner_multi_image(multi), "units.png")],
                        embeds: [new MessageEmbed()
                            .setTitle(`${banner.pretty_name} (${banner.banner_type === 11 ? "11" : "5"}x summon)`)
                            .setColor("#008080")
                            .setImage("attachment://units.png")
                            .setFooter("© Heⅼіх Sama#0578",
                                "https://cdn.discordapp.com/avatars/456276194581676062/dda3dc4e7a35fbe4afef3488054363cc.webp?size=256")
                        ]
                    })
                    break
                case "whale":
                    //TODO: Whale
                    break
                case "infos":
                    console.log(banner.unit_list_image)
                    await interaction.editReply({
                        files: [new MessageAttachment(banner.unit_list_image[0].toBuffer(), "units.png")],
                        embeds: [new MessageEmbed()
                            .setTitle(`Units in ${banner.pretty_name}  [Page: 1]`)
                            .setColor("#008080")
                            .setImage("attachment://units.png")
                            .setFooter("© Heⅼіх Sama#0578",
                                "https://cdn.discordapp.com/avatars/456276194581676062/dda3dc4e7a35fbe4afef3488054363cc.webp?size=256")
                        ],
                        components: [
                            new MessageActionRow().addComponents(
                                new MessageButton().setCustomId("prev").setStyle("PRIMARY").setEmoji("⬅️"),
                                new MessageButton().setCustomId("next").setStyle("PRIMARY").setEmoji("➡️")
                            )
                        ]
                    })

                    let pointer = 0
                    const filter = i => (i.customId === 'prev' || i.customId === 'next') && i.user.id === interaction.user.id
                    const collector = interaction.channel.createMessageComponentCollector({filter, message: msg})

                    collector.on("collect", async i => {
                        if (!i.isButton()) return

                        switch (i.customId) {
                            case "prev":
                                pointer -= 1
                                if (pointer < 0) pointer = banner.unit_list_image.length - 1
                                break
                            case "next":
                                pointer += 1
                                if (pointer === banner.unit_list_image.length) pointer = 0
                                break
                        }

                        await i.message.removeAttachments()
                        await i.deferUpdate()
                        await i.editReply({
                            embeds: [new MessageEmbed()
                                .setTitle(`Units in ${banner.pretty_name} [Page: ${pointer + 1}]`)
                                .setColor("#008080")
                                .setImage("attachment://units.png")
                                .setFooter("© Heⅼіх Sama#0578",
                                    "https://cdn.discordapp.com/avatars/456276194581676062/dda3dc4e7a35fbe4afef3488054363cc.webp?size=256")
                            ],
                            files: [new MessageAttachment(banner.unit_list_image[pointer].toBuffer(), "units.png")]
                        })
                    })

                    break
            }
        })

        collector.on('collect', async i => {
            if (!i.isButton()) return
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

            await i.deferUpdate()
            await i.editReply({
                embeds: [new MessageEmbed()
                    .setTitle(ALL_BANNER_LIST[pointer].pretty_name)
                    .setColor("#008080")
                    .setImage(ALL_BANNER_LIST[pointer].background)
                    .setFooter("© Heⅼіх Sama#0578",
                        "https://cdn.discordapp.com/avatars/456276194581676062/dda3dc4e7a35fbe4afef3488054363cc.webp?size=256")
                ],
                components: comps
            })
        })
    }
}