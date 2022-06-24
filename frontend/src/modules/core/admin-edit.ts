import { CommandInteraction, CacheType } from "discord.js";
import unitDataHandler from "../../implementations/default/unit-data-handler";
import ICommandExecutor from "../../interfaces/i-command-executor";
import { Event, Grade, Race, Type, Unit, Affection } from "../../models/unit";
import { unitCache } from "../../utilities/cache";

export default class AdminEditCExecutor implements ICommandExecutor {
	commandName(): string {
		return "admin edit";
	}

	async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
		await interaction.deferReply();

		let u: Unit = unitCache.getAll().reduce((p, c) => (p.id == interaction.options.getInteger("unitid", true) ? p : c));
		const val: string = interaction.options.getString("value", true);

		switch (interaction.options.getString("key", true)) {
			case "name":
				u.name = val;
				await unitDataHandler.editUnit(u, "unit_name", val);
				break;
			case "simple_name":
				u.simpleName = val;
				await unitDataHandler.editUnit(u, "simple_name", val);
				break;
			case "unit_type":
				u.type = Type.fromString(val);
				await unitDataHandler.editUnit(u, "unit_type", Type.fromString(val).toString());
				break;
			case "race":
				u.race = Race.fromString(val);
				await unitDataHandler.editUnit(u, "race", Race.fromString(val).toString());
				break;
			case "unit_event":
				u.event = Event.fromString(val);
				await unitDataHandler.editUnit(u, "unit_event", Event.fromString(val).toString());
				break;
			case "grade":
				u.grade = Grade.fromString(val);
				await unitDataHandler.editUnit(u, "grade", Grade.fromString(val).toString());
				break;
			case "affection":
				u.affection = Affection.fromString(val);
				await unitDataHandler.editUnit(u, "affection", Affection.fromString(val).toString());
				break;
			case "banner":
				u.homeBanners = val.split(",");
				await unitDataHandler.editUnit(u, "banner", val);
				break;
			case "altnames":
				u.altNames = val.split(",");
				await unitDataHandler.editUnit(u, "", val);
				break;
			case "emoji":
				u.emoji = `<:${u.id > 9 ? u.id : "0" + u.id}:${val}>`;
				await unitDataHandler.editUnit(u, "emoji", val);
				break;
			case "icon_url":
				u.iconURL = val;
				u = (await u.fetchIcon()).loadIcon();
				await unitDataHandler.editUnit(u, "icon_url", val);
				break;
			default:
				break;
		}

		await interaction.editReply({
			content: "Updated Unit!",
			embeds: [u.infoEmbed()],
		});
	}
}
