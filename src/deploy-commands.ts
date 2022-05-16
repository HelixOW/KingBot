import { readCommands, ICommand } from "./interfaces/ICommand";
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { token, clientId } = require("../data/config.json");

const commands = [];

readCommands((command: ICommand) => commands.push(command.data.toJSON()));

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
	try {
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
