const {createCanvas} = require("canvas");
const {IMG_SIZE} = require("./constants")
const {chunk} = require("./general_helper");
const draw_offset = 5

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
            let icon = await ukv.unit.refresh_icon()
            let ictx = icon.getContext("2d")

            ictx.font = "42px arial"
            ictx.textAlign = "center"
            ictx.fillStyle = "#ffffff"

            ictx.fillText(ukv.amount.toString(), ctx.measureText("1").width + 20, 42)
            ctx.drawImage(icon, x, y, IMG_SIZE, IMG_SIZE)
            x += IMG_SIZE + 5
        }
        y += IMG_SIZE + 5
    }

    return canvas.toBuffer()
}

module.exports = {
    banner_rotation_image: banner_rotation_image
}