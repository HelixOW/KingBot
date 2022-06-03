import { Collection } from "discord.js";
import { ICommand } from "../../interfaces/i-command";

import FindCExecutor from "./find";
import AdminAddCExecutor from "./admin-add";
import AdminEditCExecutor from "./admin-edit";
import AdminReloadCExecutor from "./admin-reload";

export const active: boolean = true;

export function onLoad(cmds: Collection<String, ICommand>): void {
	if (!active) return;

	cmds.get("find").addExecutor(new FindCExecutor());
	cmds.get("admin").addExecutor(new AdminAddCExecutor());
	cmds.get("admin").addExecutor(new AdminEditCExecutor());
	cmds.get("admin").addExecutor(new AdminReloadCExecutor());
}
