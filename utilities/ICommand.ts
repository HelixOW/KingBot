import { CommandInteraction } from "discord.js";
import { readdirSync, statSync, readFileSync } from "fs";
import * as path from "path";

export interface ICommand {
	get data(): any;
	execute(interaction: CommandInteraction): Promise<any>;
}

export function readCommands(callback: Function, dir: string = "commands"): void {
	const commandFiles: { path: string; osFile: string }[] = [];

	function rec(rDir: string) {
		readdirSync(rDir).forEach(file => {
			const abs = path.join(rDir, file);

			if (statSync(abs).isDirectory()) return rec(abs);
			else if (file.endsWith(".ts") && readFileSync(abs).toString().includes("implements ICommand")) {
				commandFiles.push({
					path: rDir.replace("\\", "/"),
					osFile: file,
				});
			}
		});
	}

	rec(dir);

	commandFiles.forEach(async cmdData => {
		const commandClass = await import("../" + cmdData.path + "/" + cmdData.osFile);
		const command = new commandClass.default();

		callback(command);
	});
}
