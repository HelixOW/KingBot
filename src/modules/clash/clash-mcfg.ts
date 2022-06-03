import { Collection } from "discord.js";
import { ICommand } from "../../interfaces/i-command";

export const active: boolean = true;

export function onLoad(cmds: Collection<String, ICommand>): void {
	if (!active) return;

    
}
