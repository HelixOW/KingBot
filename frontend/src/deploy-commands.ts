import { readCommands } from "./interfaces/i-command";
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { token, clientId } = require("../data/config.json");

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
	try {
		const commands: any = (await readCommands()).map(cmd => cmd.data.toJSON());

		await rest.put(
			Routes.applicationGuildCommands(clientId, "812695655852015628"),
			//Routes.applicationCommands(clientId),
			{ body: commands }
		);

		console.log("Successfully registered application commands.");
		process.exit(1);
	} catch (e) {
		console.error(e);
	}
})();
