import ICommandExecutor from "./i-command-executor";
import { readDir, readFile } from "../utils/general";
import DefaultCExecutor from "../modules/module-not-activated";

export abstract class ICommand {
	private _executor: ICommandExecutor;

	public get executor() {
		return this._executor;
	}

	public set executor(nExec: ICommandExecutor) {
		this._executor = nExec;
	}

	public ICommand(executor: ICommandExecutor = new DefaultCExecutor()) {
		this.executor = executor;
	}

	abstract get data(): any;
}

export async function readCommands(dir: string = "commands"): Promise<ICommand[]> {
	const commandFiles: { path: string; osFile: string }[] = readDir(
		dir,
		(file, abs) => file.endsWith(".ts") && readFile(abs).includes("extends ICommand") && file.includes("-cdef")
	);

	return await Promise.all(
		commandFiles.map(async cmdData => {
			const commandClass = await import("../" + cmdData.path + "/" + cmdData.osFile);

			return new commandClass.default();
		})
	);
}
