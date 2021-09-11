const {SlashCommandBuilder} = require("@discordjs/builders");
const units = require("../utils/units")
const {MessageActionRow, MessageButton} = require("discord.js");
const {UNIT_LIST} = require("../utils/units");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("find")
        .setDescription("Check if unit is present.")
        .addStringOption(option =>
            option.setName('unit')
                .setDescription("What unit do you want to find? (Name or ID)")
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName("custom")
                .setDescription("Do you want to include custom units?")),

    async execute(interaction) {
        // interaction.options.getString("unit")
        const unit = units.unit_by_vague_name(interaction.options.getString("unit"),
            interaction.options.getBoolean("custom") ? UNIT_LIST : UNIT_LIST.filter(u => u.event !== units.Event.CUSTOM))
        let pointer = 0


        await interaction.reply({
            embeds: [unit[pointer].info_embed()],
            components: unit.length > 1 ? [new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("prev")
                    .setLabel("Previous")
                    .setStyle("PRIMARY")
                    .setEmoji("⬅️"),
                new MessageButton()
                    .setCustomId("next")
                    .setLabel("Next")
                    .setStyle("PRIMARY")
                    .setEmoji("➡️")
            )] : []
        })

        const filter = i => (i.customId === 'prev' || i.customId === 'next') && i.user.id === interaction.user.id
        const collector = interaction.channel.createMessageComponentCollector({filter})

        collector.on('collect', async i => {
            if(i.customId === "prev") {
                pointer -= 1
                if(pointer < 0) pointer = unit.length - 1
                await i.update({
                    embeds: [unit[pointer].info_embed()]
                })
            } else if(i.customId === "next") {
                pointer += 1
                if(pointer > unit.length) pointer = 0
                await i.update({
                    embeds: [unit[pointer].info_embed()]
                })
            }
        })
    },
}