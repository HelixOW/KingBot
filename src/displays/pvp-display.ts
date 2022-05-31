import { chunk } from "../utils/general";
import { DRAW_OFFSET, IMG_SIZE } from "../utilities/constants";
import { createCanvas } from "canvas";
import { copyCanvas } from "../utils/display";
import { Unit } from "../models/unit";

export async function teamDisplay(team: Unit[]): Promise<Buffer> {
	const teamRows = chunk(team, 4);

	const canvas = createCanvas(IMG_SIZE * 4 + DRAW_OFFSET * 3, IMG_SIZE * teamRows.length + DRAW_OFFSET * (teamRows.length - 1));
	const ctx = canvas.getContext("2d");

	let y = 0;
	for (const teamRow of teamRows) {
		let x = 0;
		for (const unit of teamRow) {
			let icon = copyCanvas(await unit.refreshIcon());

			ctx.drawImage(icon, x, y);

			x += IMG_SIZE + DRAW_OFFSET;
		}
		y += IMG_SIZE + DRAW_OFFSET;
	}

	return canvas.toBuffer();
}
