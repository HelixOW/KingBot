const { MessageEmbed } = require("discord.js");

class DefaultEmbed extends MessageEmbed {
    constructor(title = undefined) {
        super()

        if(title !== undefined) this.setTitle(title)
        this.setColor("#008080")
        .setFooter("© Heⅼіх Sama#0578",
                    "https://cdn.discordapp.com/avatars/456276194581676062/dda3dc4e7a35fbe4afef3488054363cc.webp?size=256")

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
    }
}