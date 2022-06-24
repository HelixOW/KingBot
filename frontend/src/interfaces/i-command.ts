import ICommandExecutor from "./i-command-executor";
import { readDir, readFile } from "../utils/general";
import DefaultCExecutor from "../modules/module-not-activated";
import { Collection } from "discord.js";

export abstract class ICommand {
	private _executor: Collection<string, ICommandExecutor> = new Collection();

	public get executor(): Collection<string, ICommandExecutor> {
		return this._executor;
	}

	public addExecutor(nExecutor: ICommandExecutor) {
		this._executor.set(nExecutor.commandName(), nExecutor);
	}

	public set executor(nExecutors: Collection<string, ICommandExecutor>) {
		this._executor = nExecutors;
	}

	public ICommand(executor: ICommandExecutor = new DefaultCExecutor()) {
		this.addExecutor(executor);
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
