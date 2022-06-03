import { CommandInteraction, CacheType } from "discord.js";
import unitDataHandler from "../../implementations/default/unit-data-handler";
import ICommandExecutor from "../../interfaces/i-command-executor";
import { Event, Grade, Race, Type, Unit, Affection } from "../../models/unit";

export default class AdminAddCExecutor implements ICommandExecutor {
	commandName(): string {
		return "admin add";
	}

	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		await interaction.deferReply();

		let u: Unit = (
			await new Unit(
				-1,
				interaction.options.getString("name", true),
				interaction.options.getString("simplename", true),
				interaction.options.getString("simplename", true),
				interaction.options.getString("altnames") ? interaction.options.getString("altnames").split(",") : [],
				Type.fromString(interaction.options.getString("type", true)),
				Grade.fromString(interaction.options.getString("grade", true)),
				Race.fromString(interaction.options.getString("race", true)),
				Event.fromString(interaction.options.getString("event", true)),
				Affection.fromString(interaction.options.getString("affection", true)),
				interaction.options.getString("banner") ? [interaction.options.getString("banner")] : [],
				interaction.options.getString("emoji", true),
				interaction.options.getString("iconurl", true)
			).fetchIcon()
		).loadIcon();

		await unitDataHandler.registerUnit(u);

		await interaction.editReply({
			embeds: [u.infoEmbed()],
		});
	}
}
