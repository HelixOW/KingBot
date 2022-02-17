import { createCanvas, Canvas, Image } from 'canvas';
import { IMG_SIZE } from "./constants";
import { chunk, chunkMap } from './general';
import { Collection } from 'discord.js';
import { Unit } from './units';
import drawText from 'node-canvas-text';

const DRAW_OFFSET = 5

export function copyCanvas(canvas: Canvas): Canvas {
    const nCanvas = createCanvas(canvas.width, canvas.height)
    const ctx = nCanvas.getContext("2d")
    ctx.drawImage(canvas, 0, 0)
    return nCanvas
}

export async function bannerRotationDisplay(pulledUnits: Collection<Unit, number>): Promise<Buffer> {
    const pullRows = chunkMap(pulledUnits, 5)
    const canvas = createCanvas(
        (IMG_SIZE * 5) + (DRAW_OFFSET * 4),
        (IMG_SIZE * pullRows.length) + (DRAW_OFFSET * (pullRows.length - 1))
    )
    const ctx = canvas.getContext("2d")
    let y = 0

    for (const unitRow of pullRows) {
        let x = 0
        for (const [unit, amount] of unitRow) {
            let icon = copyCanvas(await unit.refreshIcon())
            let ictx = icon.getContext("2d")

            ictx.font = "42px arial"
            ictx.textAlign = "center"
            ictx.fillStyle = "#db1102"

            ictx.fillText(amount.toString(), ctx.measureText(amount.toString()).width + 20, 42)
            ctx.drawImage(icon, x, y)
            x += IMG_SIZE + DRAW_OFFSET
        }
        y += IMG_SIZE + DRAW_OFFSET
    }

    return canvas.toBuffer()
}

export async function bannerMultiDisplay(pulledUnits: Unit[], fiveSummon: boolean = false): Promise<Buffer> {
    const pullRows = chunk(pulledUnits, (fiveSummon ? 3 : 4))
    const canvas = createCanvas(
        (IMG_SIZE * (fiveSummon ? 3 : 4)) + (DRAW_OFFSET * (fiveSummon ? 2 : 3)),
        (IMG_SIZE * pullRows.length) + (DRAW_OFFSET * (pullRows.length - 1))
    )
    const ctx = canvas.getContext("2d")
    let y = 0

    for(const unitRow of pullRows) {
        let x = 0
        for(const unit of unitRow) {
            let icon = await unit.refreshIcon()

            if(fiveSummon && y > 0)
                ctx.drawImage(icon, x + DRAW_OFFSET + (0.5 * IMG_SIZE), y)
            else
                ctx.drawImage(icon, x, y)
            x += IMG_SIZE + DRAW_OFFSET
        }
        y += IMG_SIZE + DRAW_OFFSET
    }

    return canvas.toBuffer()
}

export async function bannerWhaleDisplay(units: Unit[], ssrs: Collection<Unit, number>, fiveSummon: boolean = false): Promise<Buffer> {
    const pullRows = chunk(units, fiveSummon ? 3 : 4)
    const ssrRows = chunkMap(ssrs, fiveSummon ? 3 : 4)

    const canvas = createCanvas(
        (IMG_SIZE * (fiveSummon ? 3 : 4)) + (DRAW_OFFSET * (fiveSummon ? 2 : 3)),
        (((IMG_SIZE * (fiveSummon ? 2 : 3)) + (DRAW_OFFSET * (fiveSummon ? 1 : 2))) + (ssrRows.length > 0 ?
            ((
                (DRAW_OFFSET + 50 + DRAW_OFFSET) +
                (IMG_SIZE * ssrRows.length + (DRAW_OFFSET * (ssrRows.length - 1)))
            )) : 0)
        )
    )

    const ctx = canvas.getContext("2d")
    let y = 0

    for(const unitRow of pullRows) {
        let x = 0
        for(const unit of unitRow) {
            let icon = await unit.refreshIcon()

            if(fiveSummon && y > 0)
                ctx.drawImage(icon, x + DRAW_OFFSET + (0.5 * IMG_SIZE), y)
            else
                ctx.drawImage(icon, x, y)
            x += IMG_SIZE + DRAW_OFFSET
        }
        y += IMG_SIZE + DRAW_OFFSET
    }

    ctx.font = "42px arial"
    ctx.fillStyle = "#fff"

    y += DRAW_OFFSET + 25
    ctx.fillText("Drawn SSR:", DRAW_OFFSET, y)
    y += 25

    ctx.fillStyle = "#db1102"
    
    for(const ssrRow of ssrRows) {
        let x = 0
        for(const unit of ssrRow) {
            let icon = await unit[0].refreshIcon()
            ctx.drawImage(icon, x, y)
            
            ctx.fillText(unit[1].toString(), x + 20, y + 42)
            x += IMG_SIZE + DRAW_OFFSET
        }
        y += IMG_SIZE + DRAW_OFFSET
    }

    return canvas.toBuffer()
}

export async function splitBoxDisplay(box: {unit: Unit, amount: number}[]): Promise<Buffer[]> {
    if(box.length < 5 || box.length / 5 < 5)
        return new Promise(async resolve => resolve([await boxDisplay(box)]))
    
    const boxImages: Buffer[] = []
    const boxParts = chunk(box, box.length / 5)

    for(let boxPart of boxParts) {
        const boxRows = chunk(boxPart, 4)

        boxImages.push(await createBoxDisplay(boxRows))
    }

    return boxImages
}

export async function createBoxDisplay(boxRows: {unit: Unit, amount: number}[][]): Promise<Buffer> {
    const canvas = createCanvas(
        (IMG_SIZE * 5) + (DRAW_OFFSET * 4),
        ((IMG_SIZE * boxRows.length) + (DRAW_OFFSET * (boxRows.length - 1)))
    )
    const ctx = canvas.getContext("2d")
    let y = 0

    for (const boxRow of boxRows) {
        let x = 0
        for (const {unit, amount} of boxRow) {
            let icon = copyCanvas(await unit.refreshIcon())
            let ictx = icon.getContext("2d")

            ictx.font = "42px arial"
            ictx.textAlign = "center"
            ictx.fillStyle = "#db1102"

            ictx.fillText(amount.toString(), ctx.measureText(amount.toString()).width + 20, 42)
            ctx.drawImage(icon, x, y)
            x += IMG_SIZE + DRAW_OFFSET
        }
        y += IMG_SIZE + DRAW_OFFSET
    }

    return canvas.toBuffer()
}

export async function boxDisplay(box: {unit: Unit, amount: number}[]): Promise<Buffer> {
    return await createBoxDisplay(chunk(box, 5))
}

export function imageToBuffer(img: Image): Buffer {
    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(img, 0, 0)
    return canvas.toBuffer()
}

export async function teamDisplay(team: Unit[]): Promise<Buffer> {
    const teamRows = chunk(team, 4)

    const canvas = createCanvas(
        (IMG_SIZE * 4) + (DRAW_OFFSET * 3),
        ((IMG_SIZE * teamRows.length) + (DRAW_OFFSET * (teamRows.length - 1)))
    )
    const ctx = canvas.getContext("2d")
    
    let y = 0
    for (const teamRow of teamRows) {
        let x = 0
        for (const unit of teamRow) {
            let icon = copyCanvas(await unit.refreshIcon())

            ctx.drawImage(icon, x, y)

            x += IMG_SIZE + DRAW_OFFSET
        }
        y += IMG_SIZE + DRAW_OFFSET
    }

    return canvas.toBuffer()
}