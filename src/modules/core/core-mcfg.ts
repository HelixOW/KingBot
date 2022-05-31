import { Collection } from "discord.js";
import { ICommand } from "../../interfaces/i-command";

import FindCExecutor from "./find";
import AdminCExecutor from "./admin";

export const active: boolean = true;

export function onLoad(cmds: Collection<String, ICommand>): void {
	if (!active) return;

	cmds.get("find").executor = new FindCExecutor();
	cmds.get("admin").executor = new AdminCExecutor();
}
