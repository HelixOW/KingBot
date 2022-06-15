import { Collection } from "discord.js";
import { ICommand } from "../../interfaces/i-command";
import ClashInfoCExecutor from "./clash-info";
import ClashJoinCExecutor from "./clash-join";
import ClashLeaveCExecutor from "./clash-leave";

export const active: boolean = true;

export function onLoad(cmds: Collection<String, ICommand>): void {
	if (!active) return;

	cmds.get("clash").addExecutor(new ClashJoinCExecutor());
	cmds.get("clash").addExecutor(new ClashLeaveCExecutor());
	cmds.get("clash").addExecutor(new ClashInfoCExecutor());
}
