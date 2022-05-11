import { Client, Collection, Intents } from "discord.js";
import { ICommand } from "./utilities/ICommand";
import { readUnitsFromDatabase, readBannersFromDatabase } from "./utils/database_helper";
import { ErrorEmbed } from "./utils/embeds";
const { token } = require("./data/config.json");

export const client: Client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const commands: Collection<String, any> = new Collection<String, any>();

ICommand.getImplementations().forEach(iCommand => {
    commands.
});

client.once("ready", async () => {
	await readUnitsFromDatabase();
	await readBannersFromDatabase();

	const adminCommand = (await client.guilds.cache.get("812695655852015628").commands.fetch()).get("946553453042356245");
	adminCommand.permissions.add({
		permissions: [
			{
				id: "204150777608929280",
				type: "USER",
				permission: true,
			},
		],
	});

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
