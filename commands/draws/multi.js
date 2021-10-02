const {SlashCommandBuilder} = require("@discordjs/builders")
const {banner_by_name} = require("../../utils/banners_helper")
const {banner_rotation_image, banner_multi_image} = require("../../utils/image_helper")
const {MessageAttachment, MessageEmbed, MessageActionRow, MessageButton} = require("discord.js");
const units_helper = require("../../utils/units_helper")
const {Grade} = units_helper

module.exports = {
    data: new SlashCommandBuilder()
        .setName("multi")
        .setDescription("Do a multi on any current banner.")
        .addStringOption(option =>
            option.setName('banner')
                .setDescription("Which banner do you want to pull from?"))
        .addUserOption(option =>
            option.setName("for")
                .setDescription("Who do you want to do a multi for?"))
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("How many multis do you want to do?")),

    async execute(interaction) {
        let banner,
            amount = interaction.options.getInteger("amount"),
            person = interaction.options.getUser("for")

        if(interaction.options.getString("banner") === null)
            banner = banner_by_name("banner 1")
        else {
            banner = banner_by_name(interaction.options.getString("banner"))

            if(banner === undefined)
                return interaction.reply({content: `Can't find the \`${interaction.options.getString("banner")}\` banner.`})
        }

        if(amount === undefined)
            amount = 1

        if(person === undefined || person === null)
            person = interaction.member

        if(amount < 0) {
            const units = []
            for(let i = 0; i < (banner.loyalty / 30) * 11; i++) {
                const unit = await banner.unit_by_chance()

                if(units.filter(u => u.unit.id === unit.id).length > 0)
                    units.filter(u => u.unit.id === unit.id)[0].amount++
                else
                    units.push({unit: unit, amount: 1})
            }

            if(units.length > 0)
                units.sort((a, b) => Grade.to_int(b.unit.grade) - Grade.to_int(a.unit.grade))

            let img = await banner_rotation_image(units)

            await interaction.deferReply()
            return await interaction.editReply({
                files: [new MessageAttachment(img, "units.png")],
                content: (person === interaction.member ? " " : `Rotation for ${person}`),
                embeds: [new MessageEmbed()
                    .setTitle(`1 Rotation on ${banner.pretty_name} (${banner.loyalty} Gems)`)
                    .setColor("#008080")
                    .setImage("attachment://units.png")
                    .setFooter("© Heⅼіх Sama#0578",
                        "https://cdn.discordapp.com/avatars/456276194581676062/dda3dc4e7a35fbe4afef3488054363cc.webp?size=256")
                ]
            })
        }

        const units = []

        for(let i = 1; i <= amount; i++) {
            const multi = []
            for(let unit = 0; unit < banner.banner_type; unit++)
                multi.push(await banner.unit_by_chance())
            units.push(multi)
        }

        await interaction.deferReply()
        let msg = await interaction.editReply({
            content: (person === interaction.member ? " " : `Multi for ${person}`),
            files: [new MessageAttachment(await banner_multi_image(units[0]), "units.png")],
            embeds: [new MessageEmbed()
                .setTitle(`${banner.pretty_name} (${banner.banner_type === 11 ? "11" : "5"}x summon)`)
                .setColor("#008080")
                .setImage("attachment://units.png")
                .setFooter("© Heⅼіх Sama#0578",
                    "https://cdn.discordapp.com/avatars/456276194581676062/dda3dc4e7a35fbe4afef3488054363cc.webp?size=256")
            ],
            components: units.length > 1 ? [new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("prev")
                    .setStyle("PRIMARY")
                    .setEmoji("⬅️"),
                new MessageButton()
                    .setCustomId("next")
                    .setStyle("PRIMARY")
                    .setEmoji("➡️")
            )] : [],
        })

        if(units.length === 1)
            return

        let pointer = 0
        const filter = i => (i.customId === 'prev' || i.customId === 'next') && i.user.id === interaction.user.id
        const collector = interaction.channel.createMessageComponentCollector({filter, message: msg})

        collector.on('collect', async i => {
            if (!i.isButton()) return
            await i.message.removeAttachments()

            if(i.customId === "prev") {
                pointer -= 1
                if(pointer < 0) pointer = units.length - 1
            } else if(i.customId === "next") {
                pointer += 1
                if(pointer === units.length) pointer = 0
            }

            if(units[pointer] === undefined || units[pointer] === null || units[pointer].length === 0) return
            await i.deferUpdate()
            await i.editReply({
                files: [new MessageAttachment(await banner_multi_image(units[pointer]), "units.png")],
                embeds: [new MessageEmbed()
                    .setTitle(`${banner.pretty_name} (${banner.banner_type === 11 ? "11" : "5"}x summon) [${pointer + 1}.]`)
                    .setColor("#008080")
                    .setImage("attachment://units.png")
                    .setFooter("© Heⅼіх Sama#0578",
                        "https://cdn.discordapp.com/avatars/456276194581676062/dda3dc4e7a35fbe4afef3488054363cc.webp?size=256")
                ],
            })
        })
    },
}