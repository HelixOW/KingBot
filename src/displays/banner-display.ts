import { Collection } from "discord.js";
import { chunkMap, chunk } from "../utils/general";
import { createCanvas } from "canvas";
import { DRAW_OFFSET, IMG_SIZE } from "../utilities/constants";
import { copyCanvas } from "../utils/display";
import { Unit } from "../models/unit";

export async function rotationDisplay(pulledUnits: Collection<Unit, number>): Promise<Buffer> {
	const pullRows = chunkMap(pulledUnits, 5);
	const canvas = createCanvas(IMG_SIZE * 5 + DRAW_OFFSET * 4, IMG_SIZE * pullRows.length + DRAW_OFFSET * (pullRows.length - 1));
	const ctx = canvas.getContext("2d");
	let y = 0;

	for (const unitRow of pullRows) {
		let x = 0;
		for (const [unit, amount] of unitRow) {
			let icon = copyCanvas(await unit.refreshIcon());
			let ictx = icon.getContext("2d");

			ictx.font = "42px arial";
			ictx.textAlign = "center";
			ictx.fillStyle = "#db1102";

			ictx.fillText(amount.toString(), ctx.measureText(amount.toString()).width + 20, 42);
			ctx.drawImage(icon, x, y);
			x += IMG_SIZE + DRAW_OFFSET;
		}
		y += IMG_SIZE + DRAW_OFFSET;
	}

	return canvas.toBuffer();
}

export async function multiDisplay(pulledUnits: Unit[], fiveSummon: boolean = false): Promise<Buffer> {
	const pullRows = chunk(pulledUnits, fiveSummon ? 3 : 4);
	const canvas = createCanvas(IMG_SIZE * (fiveSummon ? 3 : 4) + DRAW_OFFSET * (fiveSummon ? 2 : 3), IMG_SIZE * pullRows.length + DRAW_OFFSET * (pullRows.length - 1));
	const ctx = canvas.getContext("2d");
	let y = 0;

	for (const unitRow of pullRows) {
		let x = 0;
		for (const unit of unitRow) {
			let icon = await unit.refreshIcon();

			if (fiveSummon && y > 0) ctx.drawImage(icon, x + DRAW_OFFSET + 0.5 * IMG_SIZE, y);
			else ctx.drawImage(icon, x, y);
			x += IMG_SIZE + DRAW_OFFSET;
		}
		y += IMG_SIZE + DRAW_OFFSET;
	}

	return canvas.toBuffer();
}

export async function whaleDisplay(units: Unit[], ssrs: Collection<Unit, number>, fiveSummon: boolean = false): Promise<Buffer> {
	const pullRows = chunk(units, fiveSummon ? 3 : 4);
	const ssrRows = chunkMap(ssrs, fiveSummon ? 3 : 4);

	const canvas = createCanvas(
		IMG_SIZE * (fiveSummon ? 3 : 4) + DRAW_OFFSET * (fiveSummon ? 2 : 3),
		IMG_SIZE * (fiveSummon ? 2 : 3) +
			DRAW_OFFSET * (fiveSummon ? 1 : 2) +
			(ssrRows.length > 0 ? DRAW_OFFSET + 50 + DRAW_OFFSET + (IMG_SIZE * ssrRows.length + DRAW_OFFSET * (ssrRows.length - 1)) : 0)
	);

	const ctx = canvas.getContext("2d");
	let y = 0;

	for (const unitRow of pullRows) {
		let x = 0;
		for (const unit of unitRow) {
			let icon = await unit.refreshIcon();

			if (fiveSummon && y > 0) ctx.drawImage(icon, x + DRAW_OFFSET + 0.5 * IMG_SIZE, y);
			else ctx.drawImage(icon, x, y);
			x += IMG_SIZE + DRAW_OFFSET;
		}
		y += IMG_SIZE + DRAW_OFFSET;
	}

	ctx.font = "42px arial";
	ctx.fillStyle = "#fff";

	y += DRAW_OFFSET + 25;
	ctx.fillText("Drawn SSR:", DRAW_OFFSET, y);
	y += 25;

	ctx.fillStyle = "#db1102";

	for (const ssrRow of ssrRows) {
		let x = 0;
		for (const unit of ssrRow) {
			let icon = await unit[0].refreshIcon();
			ctx.drawImage(icon, x, y);

			ctx.fillText(unit[1].toString(), x + 20, y + 42);
			x += IMG_SIZE + DRAW_OFFSET;
		}
		y += IMG_SIZE + DRAW_OFFSET;
	}

	return canvas.toBuffer();
}
