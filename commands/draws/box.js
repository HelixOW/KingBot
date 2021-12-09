const {SlashCommandBuilder} = require("@discordjs/builders")
const {MessageAttachment, MessageActionRow, MessageButton} = require("discord.js");
const units_helper = require("../../utils/units_helper");
const { DefaultEmbed, ErrorEmbed } = require("../../utils/embeds");
const {Grade} = units_helper
const {boxImage} = require("../../utils/image_helper")
const {getBox, hasBox} = require("../../utils/database_helper")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("box")
        .setDescription("Shows the box.")
        .addMentionableOption(option =>
            option.setName("for")
                .setDescription("Who do you want to do a single for?")),

    async execute(interaction) {
        let person = interaction.options.getMentionable("for")

        if(person === undefined || person === null)
            person = interaction.member

        if(!hasBox(person))
            return await interaction.reply({embeds: [
                new ErrorEmbed(`${person.displayName} doesn't have a box yet!`)
            ]})

        let box = await getBox(person)

        await interaction.deferReply()
        return await interaction.editReply({
            embeds: [new DefaultEmbed(`Box of ${person.displayName}`).setImage("attachment://box.png")],
            files: [new MessageAttachment(await boxImage(box), "box.png")]
        })
    },
}