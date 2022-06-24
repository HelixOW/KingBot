import FindCExecutor from "./find";
import AdminAddCExecutor from "./admin-add";
import AdminEditCExecutor from "./admin-edit";
import AdminReloadCExecutor from "./admin-reload";
import ICommandExecutor from "../../interfaces/i-command-executor";

export const active: boolean = true;

export function onLoad(): { name: string; exec: ICommandExecutor[] }[] {
	if (!active) return;

	return [
		{ name: "find", exec: [new FindCExecutor()] },
		{ name: "admin", exec: [new AdminAddCExecutor(), new AdminEditCExecutor(), new AdminReloadCExecutor()] },
	];
}
