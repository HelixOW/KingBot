import { chunk } from "../utils/general";
import { IMG_SIZE, DRAW_OFFSET } from "../utilities/constants";
import { createCanvas } from "canvas";
import { copyCanvas } from "../utils/display";
import { Unit } from "../models/unit";

export async function splitBoxDisplay(box: { unit: Unit; amount: number }[]): Promise<Buffer[]> {
	if (box.length < 5 || box.length / 5 < 5) return new Promise(async resolve => resolve([await boxDisplay(box)]));

	const boxImages: Buffer[] = [];
	const boxParts = chunk(box, box.length / 5);

	for (let boxPart of boxParts) {
		const boxRows = chunk(boxPart, 4);

		boxImages.push(await createBoxDisplay(boxRows));
	}

	return boxImages;
}

export async function createBoxDisplay(boxRows: { unit: Unit; amount: number }[][]): Promise<Buffer> {
	const canvas = createCanvas(IMG_SIZE * 5 + DRAW_OFFSET * 4, IMG_SIZE * boxRows.length + DRAW_OFFSET * (boxRows.length - 1));
	const ctx = canvas.getContext("2d");
	let y = 0;

	for (const boxRow of boxRows) {
		let x = 0;
		for (const { unit, amount } of boxRow) {
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

export async function boxDisplay(box: { unit: Unit; amount: number }[]): Promise<Buffer> {
	return await createBoxDisplay(chunk(box, 5));
}
