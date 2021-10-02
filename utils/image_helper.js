const {createCanvas} = require("canvas");
const {IMG_SIZE} = require("./constants")
const {chunk} = require("./general_helper");
const draw_offset = 5

function copy_canvas(canvas) {
    const nCanvas = createCanvas(canvas.width, canvas.height)
    const ctx = nCanvas.getContext("2d")
    ctx.drawImage(canvas, 0, 0)
    return nCanvas
}

async function banner_rotation_image(pulled_units) {
    const pull_rows = chunk(pulled_units, 5)
    const canvas = createCanvas(
        (IMG_SIZE * 5) + (draw_offset * 4),
        (IMG_SIZE * pull_rows.length) + (draw_offset * (pull_rows.length - 1))
    )
    const ctx = canvas.getContext("2d")
    let y = 0

    for (const units of pull_rows) {
        let x = 0
        for (const ukv of units) {
            let icon = copy_canvas(await ukv.unit.refresh_icon())
            let ictx = icon.getContext("2d")

            ictx.font = "42px arial"
            ictx.textAlign = "center"
            ictx.fillStyle = "#ffffff"

            ictx.fillText(ukv.amount.toString(), ctx.measureText(ukv.amount.toString()).width + 20, 42)
            ctx.drawImage(icon, x, y)
            x += IMG_SIZE + draw_offset
        }
        y += IMG_SIZE + draw_offset
    }

    return canvas.toBuffer()
}

async function banner_multi_image(pulled_units) {
    const pull_rows = chunk(pulled_units, 4)
    const canvas = createCanvas(
        (IMG_SIZE * 4) + (draw_offset * 3),
        (IMG_SIZE * pull_rows.length) + (draw_offset * (pull_rows.length - 1))
    )
    const ctx = canvas.getContext("2d")
    let y = 0

    for(const unit_row of pull_rows) {
        let x = 0
        for(const unit of unit_row) {
            let icon = await unit.refresh_icon()

            ctx.drawImage(icon, x, y)
            x += IMG_SIZE + draw_offset
        }
        y += IMG_SIZE + draw_offset
    }

    return canvas.toBuffer()
}

module.exports = {
    banner_rotation_image: banner_rotation_image,
    banner_multi_image: banner_multi_image
}