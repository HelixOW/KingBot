const {SlashCommandBuilder} = require("@discordjs/builders")
const {banner_by_name} = require("../../utils/banners_helper")
const {banner_rotation_image, banner_multi_image} = require("../../utils/image_helper")
const {MessageAttachment, MessageEmbed, MessageActionRow, MessageButton} = require("discord.js");
const units_helper = require("../../utils/units_helper");
const { DefaultEmbed } = require("../../utils/embeds");
const { multi } = require("../../utils/summons_handler");
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
            banner = banner_by_name("general")
        else {
            banner = banner_by_name(interaction.options.getString("banner"))

            if(banner === undefined)
                return interaction.reply({content: `Can't find the \`${interaction.options.getString("banner")}\` banner.`})
        }

        if(amount === null)
            amount = 1

        if(person === undefined || person === null)
            person = interaction.member

        if(amount < 0)
            return multi(interaction, banner, true)

        return multi(interaction, banner, false, amount, person)
    },
}