import { createCanvas, Image, Canvas } from "canvas";

export function imageToBuffer(img: Image): Buffer {
	const canvas = createCanvas(img.width, img.height);
	const ctx = canvas.getContext("2d");

	ctx.drawImage(img, 0, 0);
	return canvas.toBuffer();
}

export function resizeImage(image: Image, w: number, h: number): Canvas {
	let canvas = createCanvas(w, h);
	let ctx = canvas.getContext("2d");

	ctx.save();
	ctx.scale(w / image.width, h / image.height);
	ctx.drawImage(image, 0, 0);
	ctx.restore();

	return canvas;
}

export function copyCanvas(canvas: Canvas): Canvas {
	const nCanvas = createCanvas(canvas.width, canvas.height);
	const ctx = nCanvas.getContext("2d");
	ctx.drawImage(canvas, 0, 0);
	return nCanvas;
}
