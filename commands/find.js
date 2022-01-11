const {SlashCommandBuilder, time} = require("@discordjs/builders");
const units = require("../utils/units_helper")
const {MessageActionRow, MessageButton, MessageAttachment} = require("discord.js");
const {UNIT_LIST} = require("../utils/units_helper");
const { sendMenu } = require("../utils/embeds");

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
        const unit = units.unit_by_vague_name(interaction.options.getString("unit"),
            interaction.options.getBoolean("custom") ? UNIT_LIST : UNIT_LIST.filter(u => u.event !== units.Event.CUSTOM))
        let pointer = 0

        if(unit === undefined || unit === null) return
        if(unit[pointer] === undefined || unit[pointer] === null) return

        await sendMenu(
            interaction,
            {
                embeds: [unit[pointer].info_embed()],
                components: unit.length > 1 ? [new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId("prev")
                        .setStyle("PRIMARY")
                        .setEmoji("⬅️"),
                    new MessageButton()
                        .setCustomId("next")
                        .setStyle("PRIMARY")
                        .setEmoji("➡️")
                )] : [],
                files: [new MessageAttachment(unit[pointer].icon_path)]
            }, 
            true,
            [{
                customIds: ["prev", "next"],
                idleTime: 15000,
                preCollect: async () => {},
                onCollect: async (i, message) => {
                    if (!i.isButton()) return
                    await i.message.removeAttachments()
    
                    if(i.customId === "prev") {
                        pointer -= 1
                        if(pointer < 0) pointer = unit.length - 1
                    } else if(i.customId === "next") {
                        pointer += 1
                        if(pointer === unit.length) pointer = 0
                    }
    
                    if(unit[pointer] === undefined || unit[pointer] === null) return
                    await i.update({
                        embeds: [unit[pointer].info_embed()],
                        files: [new MessageAttachment(unit[pointer].icon_path)]
                    })
                },
                postCollect: async (collected, reason) => await interaction.editReply({components: []})
            }]
        )
    },
}