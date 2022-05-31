import { Client, Collection, Intents } from "discord.js";
import { ErrorEmbed } from "./utils/embeds";
import { readCommands, ICommand } from "./interfaces/i-command";
import UnitDataHandler from "./implementations/default/unit-data-handler";
import BannerDataHandler from "./implementations/default/banner-data-handler";
import { readDir } from "./utils/general";

const { token } = require("../data/config.json");

export const client: Client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const commands: Collection<String, ICommand> = new Collection<String, ICommand>();

async function loadModules() {
	await Promise.all(
		readDir("modules", file => file.endsWith("-mcfg.ts")).map(async fileData => {
			const cfg = await import("./" + fileData.path + "/" + fileData.osFile);

			if (!cfg.active || !cfg.onLoad) return;

			await cfg.onLoad(commands);
		})
	);
}

client.once("ready", async () => {
	(await readCommands()).forEach((cmd: ICommand) => commands.set(cmd.data.name, cmd));

	const unitDataHandler = new UnitDataHandler();
	const bannerDataHandler = new BannerDataHandler();

	unitDataHandler.readUnits();
	unitDataHandler.refreshTask();

	bannerDataHandler.readBanners();
	bannerDataHandler.refreshTask();

	await loadModules();

	console.log("Ready!");
});

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	const command: ICommand = commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.executor.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			ephemeral: true,
			embeds: [new ErrorEmbed((error as Error).message, "There was an error while executing this command")],
		});
	}
});

client.login(token);
