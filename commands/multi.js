const {SlashCommandBuilder} = require("@discordjs/builders")
const {banner_by_name} = require("../utils/banners_helper")
const {banner_rotation_image} = require("../utils/image_helper")
const {MessageAttachment} = require("discord.js");
const {unit_by_id, Grade} = require("../utils/units_helper");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("multi")
        .setDescription("Do a multi on any current banner.")
        .addStringOption(option =>
            option.setName('banner')
                .setDescription("Which banner do you want to pull from?"))
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("How many multis do you want to do?")
        )
        .addUserOption(option =>
            option.setName("for")
                .setDescription("Who do you want to do a multi for?")),

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
                console.log(i)
                const unit = await banner.unit_by_chance()
                if(units.filter(u => {
                    if(u.unit === undefined) return false
                    return u.unit.id === unit.id
                }).length > 0)
                    units.filter(u => u.unit.id === unit.id)[0].amount++
                else {
                    console.log(`Added Unit: ${unit.name}`)
                    units.push({unit: unit, amount: 1})
                }
            }

            if(units.length > 0)
                units.sort((a, b) => {
                    console.log(b)
                    return Grade.to_int(b.unit.grade) - Grade.to_int(a.unit.grade)
                })

            banner_rotation_image(units).then(async img => {
                await interaction.reply({
                    files: [new MessageAttachment(img)],

                })
            })
        }
    },
}