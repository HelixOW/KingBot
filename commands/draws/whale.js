const {SlashCommandBuilder} = require("@discordjs/builders")
const {banner_by_name, find_banner_containing_unit, find_banner_containing_any_unit, ALL_BANNER_LIST} = require("../../utils/banners_helper")
const {MessageAttachment, MessageEmbed, MessageActionRow, MessageButton} = require("discord.js");
const units_helper = require("../../utils/units_helper");
const { DefaultEmbed, ErrorEmbed } = require("../../utils/embeds");
const { whale } = require("../../utils/summons_handler");
const { unit_by_vague_name } = require("../../utils/units_helper");
const {Grade} = units_helper

module.exports = {
    data: new SlashCommandBuilder()
        .setName("whale")
        .setDescription("Summon until you get a SSR or desired Unit.")
        .addStringOption(option =>
            option.setName('banner')
                .setDescription("Which banner do you want to pull from?"))
        .addMentionableOption(option =>
            option.setName("for")
                .setDescription("Who do you want to whale for?"))
        .addStringOption(option =>
            option.setName("unit")
                .setDescription("Who do you want to whale for? (Leave blank for any SSR)")),

    async execute(interaction) {
        let banner,
            unit = interaction.options.getString("unit"),
            person = interaction.options.getMentionable("for")

        if(interaction.options.getString("banner") === null)
            banner = banner_by_name("general")
        else {
            banner = banner_by_name(interaction.options.getString("banner"))

            if(banner === undefined)
                return interaction.reply({embeds: [
                    new ErrorEmbed(`Can't find the \`${interaction.options.getString("banner")}\` banner.`)
                ]})
        }

        if(person === undefined || person === null)
            person = interaction.member

        if(unit === null)
            return whale(interaction, banner, undefined, person)

        unit = unit_by_vague_name(unit).filter(u => ALL_BANNER_LIST.some(b => b.hasUnit([u])))

        if(unit.length === 0)
            return interaction.reply({embeds: [
                new ErrorEmbed(`Can't find any Unit matching the name \`${interaction.options.getString("unit")}\`.`)
            ]})

        if(unit.length === 1){
            if(!banner.units.includes(unit[0])) {
                banner = find_banner_containing_unit(unit[0])
                if(banner === undefined)
                    return interaction.reply({embeds: [
                        new ErrorEmbed(`Can't find any banner containing \`${unit[0].name}\`.`)
                    ], components: []})
            }

            return whale(interaction, banner, unit[0], person)
        }

        if(!banner.hasUnit(unit)) {
            banner = find_banner_containing_any_unit(unit)
            if(banner === undefined)
                return interaction.reply({embeds: [
                    new ErrorEmbed(`Can't find any banner containing \`${interaction.options.getString("unit")}\`.`)
                ], components: []})
        }

        await interaction.deferReply()
        let pointer = 0
        let msg = await interaction.editReply({
            content: "Which unit do you want to pull?",
            files: [new MessageAttachment((await unit[pointer].refresh_icon()).toBuffer(), "unit.png")],
            embeds: [new DefaultEmbed()
                .setTitle(unit[0].name)
                .setImage("attachment://unit.png")
            ],
            components: [new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("prev")
                    .setStyle("PRIMARY")
                    .setEmoji("⬅️"),
                new MessageButton()
                    .setCustomId("pick")
                    .setStyle("SUCCESS")
                    .setEmoji("✅"),
                new MessageButton()
                    .setCustomId("next")
                    .setStyle("PRIMARY")
                    .setEmoji("➡️")
            )],
        })

        const filter = i => (i.customId === 'prev' || i.customId === 'next' || i.customId === 'pick') && i.user.id === interaction.user.id
        const collector = interaction.channel.createMessageComponentCollector({filter, message: msg})

        collector.on('collect', async i => {
            if (!i.isButton()) return
            await i.message.removeAttachments()

            if(i.customId === "prev") {
                pointer -= 1
                if(pointer < 0) pointer = unit.length - 1
            } else if(i.customId === "next") {
                pointer += 1
                if(pointer === unit.length) pointer = 0
            } else if(i.customId === "pick") {
                if(!banner.units.includes(unit[pointer])) {
                    banner = find_banner_containing_unit(unit[pointer])
                    if(banner === undefined)
                        return interaction.editReply({embeds: [
                            new ErrorEmbed(`Can't find any banner containing \`${unit[pointer].name}\`.`)
                        ], components: []})
                }
                await i.deferUpdate()
                return whale(interaction, banner, unit[pointer], person, false)
            }

            if(unit[pointer] === undefined || unit[pointer] === null || unit[pointer].length === 0) return
            await i.deferUpdate()
            await i.editReply({
                files: [new MessageAttachment((await unit[pointer].refresh_icon()).toBuffer(), "unit.png")],
                embeds: [new DefaultEmbed()
                    .setTitle(unit[pointer].name)
                    .setImage("attachment://unit.png")
                ],
            })
        })
    },
}