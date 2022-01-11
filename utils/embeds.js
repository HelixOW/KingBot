const { MessageEmbed, CommandInteraction } = require("discord.js");

class DefaultEmbed extends MessageEmbed {
    constructor(title = undefined) {
        super()

        if(title !== undefined) this.setTitle(title)
        this.setColor("#008080")
        .setFooter({text: "© Heⅼіх Sama#0578", iconURL: "https://cdn.discordapp.com/avatars/456276194581676062/dda3dc4e7a35fbe4afef3488054363cc.webp?size=256"})

        this.blankFields = 0
    }

    addBlankField(inline=false, value="\u200b") {
        this.blankFields++
        this.addField(
            "\u200b".repeat(this.blankFields),
            value,
            inline
        )
        return this
    }
}

module.exports = {
    DefaultEmbed: DefaultEmbed,

    ErrorEmbed: class ErrorEmbed extends DefaultEmbed {
        constructor(title) {
            super()
            
            this.setTitle("Error")
            this.setDescription(title)
            this.setColor("#db1102")
        }
    },

    /**
     * Callback for what's happening before the collecting starts
     * @callback  preCollectCallback
     */

    /**
     * Callback for what's happening when an Item is collected
     * @callback  onCollectCallback
     * @param {CommandInteraction} interaction
     * @param {Message} [message = undefined]
     */

    /**
     * Callback for what's happening when the collector stops
     * @callback  postCollectCallback
     * @param {Array} [collected = []]
     * @param {string} [reason = ""]
     */

    /**
     * @typedef ReplyOptions
     * @type {Object}
     * @property {Array} embeds
     * @property {Array} components
     * @property {Array} files
     * @property {string} content
     */

    /**
     * @typedef MenuOptions
     * @type {Object}
     * @property {string[]} customIds
     * @property {number} idleTime
     * @property {preCollectCallback} preCollect
     * @property {onCollectCallback} onCollect
     * @property {postCollectCallback} postCollect
     */

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {ReplyOptions} reply 
     * @param {boolean} deferMessage 
     * @param {MenuOptions[]} options 
     * @returns 
     */
    sendMenu: async (
        interaction,
        reply,
        deferMessage = true,
        options = [{
            customIds: [],
            idleTime: -1,
            preCollect: async () => {},
            onCollect: async (interaction, message, collector) => {},
            postCollect: async (collected, reason) => {}
        }]) => {
            if(deferMessage)
                await interaction.deferReply()

            const msg = await interaction.editReply({
                fetchReply: true,
                embeds: reply.embeds,
                components: reply.components,
                files: reply.files,
                content: reply.content
            })

            for(const option of options) {
                const filter = i => option.customIds.includes(i.customId) && i.user.id === interaction.user.id && i.message.id === msg.id
                const collector = msg.createMessageComponentCollector({filter: filter, idle: option.idleTime === -1 ? null : option.idleTime})

                try {
                    await option.preCollect()
                } catch (e) {
                    return
                }

                collector.on('collect', async i => {
                    await option.onCollect(i, msg, collector)
                })
        
                collector.on('end', async (collected, reason) => {
                    await option.postCollect(collected, reason)
                })
            }
    }
}