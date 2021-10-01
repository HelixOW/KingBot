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
    ctx.fillStyle = "#000000"
    let y = 0

    for (const units of pull_rows) {
        let x = 0
        for (const ukv of units) {
            await ukv.unit.refresh_icon().then(icon => {
                console.log(icon)
                ctx.drawImage(icon, x, y)
                ctx.fillText(ukv.amount, x + 10, y + 10)
            })
            x += IMG_SIZE + 5
        }
        y += IMG_SIZE + 5
    }

    return new Promise(resolve => resolve(canvas.toBuffer()))
}

module.exports = {
    banner_rotation_image: banner_rotation_image
}