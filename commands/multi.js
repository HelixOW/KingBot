const {SlashCommandBuilder} = require("@discordjs/builders")
const {banner_by_name} = require("../utils/banners_helper")
const {banner_rotation_image} = require("../utils/image_helper")
const {MessageAttachment, MessageEmbed} = require("discord.js");
const units_helper = require("../utils/units_helper")
const {Grade, Type} = units_helper

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
        if(interaction.options.getString("banner") == null)
            banner = banner_by_name("banner 1")
        else
            banner = banner_by_name(interaction.options.getString("banner"))

        if(amount == null)
            amount = 1

        if(person == null)
            person = interaction.user

        if(amount < 0) {
            const units = []
            for(let i = 0; i < (banner.loyalty / 30) * 11; i++) {
                const unit = await banner.unit_by_chance()

                if(units.filter(u => {
                    if(u.unit === undefined) return false
                    return u.unit.id === unit.id
                }).length > 0)
                    units.filter(u => u.unit.id === unit.id)[0].amount++
                else {
                    units.push({unit: unit, amount: 1})
                }
            }

            if(units.length > 0)
                units.sort((a, b) => {
                    return Grade.to_int(b.unit.grade) - Grade.to_int(a.unit.grade)
                })

            banner_rotation_image(units).then(async img => {
                await interaction.reply({
                    files: [new MessageAttachment(img)],
                    content: "Those are the units you pulled in 1 Rotation." + (person === interaction.user ? "" : `Coming from ${interaction.user}`),
                    embeds: [new MessageEmbed().setTitle(`1 Rotation on ${banner.pretty_name} (${banner.loyalty} Gems)`)
                        .setColor(Type.to_discord_color(this.type))]
                })
            })
        }
    },
}