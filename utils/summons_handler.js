const { DefaultEmbed, sendMenu } = require("./embeds")
const {MessageActionRow, MessageButton, MessageAttachment} = require("discord.js")
const {banner_multi_image, banner_whale_image, banner_rotation_image} = require("./image_helper");
const {Grade} = require("./units_helper");
const {addToBox} = require("./database_helper")

module.exports = {
    single: async (interaction, banner, amount = 1, person = interaction.member, ref = true) => {
        const units = []

        for(let i = 1; i <= amount; i++)
            units.push(await banner.unit_by_chance())

        await addToBox(person, units)

        let pointer = 0

        await sendMenu(
            interaction,
            {
                content: (person === interaction.member ? " " : `Single for ${person}`),
                files: [new MessageAttachment((await units[0].refresh_icon()).toBuffer(), "unit.png")],
                embeds: [new DefaultEmbed()
                    .setTitle(banner.pretty_name + " (1x summon)")
                    .setImage("attachment://unit.png")
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
            },
            ref,
            [{
                customIds: ["prev", "next"],
                idleTime: 30000,
                preCollect: async () => {if(units.length === 1) throw new Error()},
                onCollect: async (i, message) => {
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
                        files: [new MessageAttachment((await units[pointer].refresh_icon()).toBuffer(), "unit.png")],
                        embeds: [new DefaultEmbed()
                            .setTitle(`${banner.pretty_name} (1x summon) [${pointer + 1}.]`)
                            .setImage("attachment://unit.png")
                        ],
                    })
                },
                postCollect: async (collected, reason) => await interaction.editReply({components: []})
            }]
        )
    },

    multi: async (interaction, banner, rotation = false, amount = 1, person = interaction.member, ref = true) => {
        if(rotation) {
            const units = []
            const dbUnits = []
            for(let i = 0; i < (banner.loyalty / 30) * 11; i++) {
                const unit = await banner.unit_by_chance()

                if(units.filter(u => u.unit.id === unit.id).length > 0)
                    units.filter(u => u.unit.id === unit.id)[0].amount++
                else
                    units.push({unit: unit, amount: 1})
            }

            if(ref) await interaction.deferReply()
            for(let uUnit of units) {
                for(let i = 0; i < uUnit.amount; i++) {
                    dbUnits.push(uUnit.unit)
                }
            }
            await addToBox(person, dbUnits)

            if(units.length > 0)
                units.sort((a, b) => Grade.toInt(b.unit.grade) - Grade.toInt(a.unit.grade))

            return await interaction.editReply({
                files: [new MessageAttachment(await banner_rotation_image(units), "units.png")],
                content: (person === interaction.member ? " " : `Rotation for ${person}`),
                embeds: [new DefaultEmbed()
                    .setTitle(`1 Rotation on ${banner.pretty_name} (${banner.loyalty} Gems)`)
                    .setImage("attachment://units.png")
                ]
            })
        }

        const units = []
        let pointer = 0

        for(let i = 1; i <= amount; i++) {
            const multi = []
            for(let unit = 0; unit < banner.banner_type; unit++)
                multi.push(await banner.unit_by_chance())
            units.push(multi)
        }

        await addToBox(person, units.flat())

        await sendMenu(
            interaction, 
            {
                content: (person === interaction.member ? " " : `Multi for ${person}`),
                files: [new MessageAttachment(await banner_multi_image(units[0], banner.banner_type === 5), "units.png")],
                embeds: [new DefaultEmbed()
                    .setTitle(`${banner.pretty_name} (${banner.banner_type === 11 ? "11" : "5"}x summon)`)
                    .setImage("attachment://units.png")
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
            },
            ref,
            [{
                customIds: ["prev", "next"],
                idleTime: 60000,
                preCollect: async () => {if(units.length === 1) throw new Error()},
                onCollect: async (i, message) => {
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
                        files: [new MessageAttachment(await banner_multi_image(units[pointer], banner.banner_type === 5), "units.png")],
                        embeds: [new DefaultEmbed()
                            .setTitle(`${banner.pretty_name} (${banner.banner_type === 11 ? "11" : "5"}x summon) [${pointer + 1}.]`)
                            .setImage("attachment://units.png")
                        ],
                    })
                },
                postCollect: async (collected, reason) => await interaction.editReply({components: []})
            }]
        )
    },

    whale: async (interaction, banner, unit = undefined, person = interaction.member, ref = true) => {
        let drawnUnits = []
        const drawnSSRs = {}
        let counter = 0

        function containsAnyUnit(drawn) {
            for(let u of drawn) {
                if(unit === undefined) {
                    if(u.grade === Grade.SSR)
                        return [true, u]
                } else {
                    if(unit == u)
                        return [true, u]
                }
            }
            return [false, undefined]
        }

        let tempDrawn = []

        if(ref) await interaction.deferReply()

        while(!containsAnyUnit(tempDrawn)[0]) {
            for(let unit = 0; unit < banner.banner_type; unit++) {
                let tempUnit = await banner.unit_by_chance()
                tempDrawn.push(tempUnit)
                drawnUnits.push(tempUnit)
            }
            
            if (containsAnyUnit(tempDrawn)[0]) {
                let x = containsAnyUnit(tempDrawn)[1]
                if(x in drawnSSRs)
                    drawnSSRs[x] += 1
                else
                    drawnSSRs[x] = 1
            }
            counter++
        }

        await addToBox(person, drawnUnits)

        drawnUnits = drawnUnits.slice(-1 * banner.banner_type)
        
        await interaction.editReply({
            files: [new MessageAttachment(await banner_whale_image(drawnUnits, drawnSSRs, banner.banner_type === 5), "units.png")],
            embeds: [new DefaultEmbed()
                .setTitle(`${banner.pretty_name} (Whaled summons [${counter}x])`)
                .setImage("attachment://units.png")
            ],
            components: []
        })
    },

    infos: async (interaction, banner, ref = true) => {
        let pointer = 0
        await sendMenu(
            interaction,
            {
                files: [new MessageAttachment(banner.unit_list_image[0].toBuffer(), "units.png")],
                embeds: [new DefaultEmbed()
                    .setTitle(`Units in ${banner.pretty_name}  [Page: 1]`)
                    .setImage("attachment://units.png")
                ],
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton().setCustomId("prev").setStyle("PRIMARY").setEmoji("⬅️"),
                        new MessageButton().setCustomId("next").setStyle("PRIMARY").setEmoji("➡️")
                    )
                ]
            },
            ref,
            [{
                customIds: ["prev", "next"],
                idleTime: 15000,
                preCollect: async () => {},
                onCollect: async (i, message) => {
                    if (!i.isButton()) return
        
                    switch (i.customId) {
                        case "prev":
                            pointer -= 1
                            if (pointer < 0) pointer = banner.unit_list_image.length - 1
                            break
                        case "next":
                            pointer += 1
                            if (pointer === banner.unit_list_image.length) pointer = 0
                            break
                    }
        
                    await i.message.removeAttachments()
                    await i.update({
                        embeds: [new DefaultEmbed()
                            .setTitle(`Units in ${banner.pretty_name} [Page: ${pointer + 1}]`)
                            .setImage("attachment://units.png")
                        ],
                        files: [new MessageAttachment(banner.unit_list_image[pointer].toBuffer(), "units.png")]
                    })
                },
                postCollect: async (collected, reason) => await interaction.editReply({components: []})
            }]
        )
    }
}