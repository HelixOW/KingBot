import { SlashCommandBuilder } from "@discordjs/builders";
import { Banner, bannerByName } from "../../utils/banners";
import { single } from "../../utils/summons_handler";
import { GuildMember } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName("single")
        .setDescription("Do a single on any current banner.")
        .addStringOption(option =>
            option.setName('banner')
                .setDescription("Which banner do you want to pull from?"))
        .addMentionableOption(option =>
            option.setName("for")
                .setDescription("Who do you want to do a single for?"))
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("How many singles do you want to do?")),

    async execute(interaction) {
        let banner: Banner,
            amount: number = interaction.options.getInteger("amount"),
            person: GuildMember = interaction.options.getMentionable("for") as GuildMember

        if(interaction.options.getString("banner") === null)
            banner = bannerByName("general")
        else {
            banner = bannerByName(interaction.options.getString("banner"))

            if(banner === undefined)
                return interaction.reply({content: `Can't find the \`${interaction.options.getString("banner")}\` banner.`})
        }

        if(amount === null)
            amount = 1

        if(person === undefined || person === null)
            person = interaction.member as GuildMember

        if(amount < 0)
            return single(interaction, banner, 1, person)

        return single(interaction, banner, amount, person)
    },
}