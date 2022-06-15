import { Client, Collection, Intents, Modal } from "discord.js";
import { ErrorEmbed } from "./utils/embeds";
import { readCommands, ICommand } from "./interfaces/i-command";
import unitDataHandler from "./implementations/default/unit-data-handler";
import BannerDataHandler from "./implementations/default/banner-data-handler";
import { readDir } from "./utils/general";
import IModal, { readModals } from "./interfaces/i-modal";

const { token } = require("../data/config.json");

export const client: Client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const commands: Collection<string, ICommand> = new Collection<string, ICommand>();
const modals: Collection<string, IModal> = new Collection<string, IModal>();

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
	(await readModals()).forEach((mod: IModal) => modals.set(mod.name(), mod));

	const bannerDataHandler = new BannerDataHandler();

	await unitDataHandler.readUnits();
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
		try {
			await command.executor.get(`${interaction.commandName} ${interaction.options.getSubcommand()}`).execute(interaction);
		} catch (e) {
			try {
				await command.executor.get(interaction.commandName).execute(interaction);
			} catch (e2) {
				console.error(e);
				console.error(e2);
			}
		}
	} catch (error) {
		console.error(error);
		if (interaction.deferred)
			await interaction.editReply({
				embeds: [new ErrorEmbed((error as Error).message, "There was an error while executing this command")],
			});
		else
			await interaction.reply({
				ephemeral: true,
				embeds: [new ErrorEmbed((error as Error).message, "There was an error while executing this command")],
			});
	}
});

client.on("interactionCreate", async interaction => {
	if (!interaction.isModalSubmit()) return;

	const modal: IModal = modals.get(interaction.customId);

	if (!modal) return;

	try {
		await modal.execute(interaction);
	} catch (error) {
		console.error(error);
	}
});

client.login(token);
