import { Client, Collection, Intents } from "discord.js";
import { ErrorEmbed } from "./utils/embeds";
import { readCommands, ICommand } from "./interfaces/ICommand";
import UnitDataHandler from "./implementations/default/unitDataHandler";
import BannerDataHandler from "./implementations/default/bannerDataHandler";

const { token } = require("../data/config.json");

export const client: Client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const commands: Collection<String, any> = new Collection<String, any>();

client.once("ready", async () => {
	(await readCommands()).forEach((cmd: ICommand) => commands.set(cmd.data.name, cmd));

	const unitDataHandler = new UnitDataHandler();
	const bannerDataHandler = new BannerDataHandler();

	unitDataHandler.readUnits();
	unitDataHandler.refreshTask();

	bannerDataHandler.readBanners();
	bannerDataHandler.refreshTask();

	console.log("Ready!");
});

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	const command = commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: "There was an error while executing this command!",
			ephemeral: true,
			embeds: [new ErrorEmbed((error as Error).message)],
		});
	}
});

client.login(token);
