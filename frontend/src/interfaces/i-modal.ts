import { ModalSubmitInteraction } from "discord.js";
import { readDir, readFile } from "../utils/general";

export default interface IModal {
	name(): string;
	execute(interaction: ModalSubmitInteraction): Promise<any>;
}

export async function readModals(dir: string = "modules"): Promise<IModal[]> {
	const modalFiles: { path: string; osFile: string }[] = readDir(
		dir,
		(file, abs) => file.endsWith(".ts") && readFile(abs).includes("implements IModal") && file.includes("-mdef")
	);

	return await Promise.all(
		modalFiles.map(async modData => {
			const modalClass = await import("../" + modData.path + "/" + modData.osFile);

			return new modalClass.default();
		})
	);
}
