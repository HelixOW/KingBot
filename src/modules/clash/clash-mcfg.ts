import ClashInfoCExecutor from "./clash-info";
import ClashJoinCExecutor from "./clash-join";
import ClashLeaveCExecutor from "./clash-leave";
import ICommandExecutor from "../../interfaces/i-command-executor";
import ClashDraftStartCExecutor from "./draft/clash-draft-start";
import ClashDraftBoxCExecutor from "./draft/clash-draft-box";

export const active: boolean = true;

export function onLoad(): { name: string; exec: ICommandExecutor[] }[] {
	if (!active) return;

	return [
		{
			name: "clash",
			exec: [new ClashJoinCExecutor(), new ClashLeaveCExecutor(), new ClashInfoCExecutor(), new ClashDraftStartCExecutor(), new ClashDraftBoxCExecutor()],
		},
	];
}
