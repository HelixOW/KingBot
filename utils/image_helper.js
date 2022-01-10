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
            ictx.fillStyle = "#db1102"

            ictx.fillText(ukv.amount.toString(), ctx.measureText(ukv.amount.toString()).width + 20, 42)
            ctx.drawImage(icon, x, y)
            x += IMG_SIZE + draw_offset
        }
        y += IMG_SIZE + draw_offset
    }

    return canvas.toBuffer()
}

async function banner_multi_image(pulled_units, fiveSummon = false) {
    const pull_rows = chunk(pulled_units, (fiveSummon ? 3 : 4))
    const canvas = createCanvas(
        (IMG_SIZE * (fiveSummon ? 3 : 4)) + (draw_offset * (fiveSummon ? 2 : 3)),
        (IMG_SIZE * pull_rows.length) + (draw_offset * (pull_rows.length - 1))
    )
    const ctx = canvas.getContext("2d")
    let y = 0

    for(const unit_row of pull_rows) {
        let x = 0
        for(const unit of unit_row) {
            let icon = await unit.refresh_icon()
            if(fiveSummon && y > 0)
                ctx.drawImage(icon, x + draw_offset + (0.5 * IMG_SIZE), y)
            else
                ctx.drawImage(icon, x, y)
            x += IMG_SIZE + draw_offset
        }
        y += IMG_SIZE + draw_offset
    }

    return canvas.toBuffer()
}

async function banner_whale_image(units, ssrs, fiveSummon = false) {
    const pull_rows = chunk(units, fiveSummon ? 3 : 4)
    const ssr_rows = chunk(ssrs, fiveSummon ? 3 : 4)

    const canvas = createCanvas(
        (IMG_SIZE * (fiveSummon ? 3 : 4)) + (draw_offset * (fiveSummon ? 2 : 3)),
        (((IMG_SIZE * (fiveSummon ? 2 : 3)) + (draw_offset * (fiveSummon ? 1 : 2))) + (ssr_rows.length > 0 ?
            ((
                (draw_offset + 12 + draw_offset) +
                (IMG_SIZE * ssr_rows.length + (draw_offset * (ssr_rows.length - 1)))
            )) : 0)
        )
    )

    const ctx = canvas.getContext("2d")
    let y = 0

    for(const unit_row of pull_rows) {
        let x = 0
        for(const unit of unit_row) {
            let icon = await unit.refresh_icon()

            if(fiveSummon && y > 0)
                ctx.drawImage(icon, x + draw_offset + (0.5 * IMG_SIZE), y)
            else
                ctx.drawImage(icon, x, y)
            x += IMG_SIZE + draw_offset
        }
        y += IMG_SIZE + draw_offset
    }

    y += draw_offset + 12 + draw_offset

    for(const ssr_row of ssr_rows) {
        let x = 0
        for(const unit of ssr_row) {
            let icon = await unit.refresh_icon()

            ctx.drawImage(icon, x, y)
            x += IMG_SIZE + draw_offset
        }
        y += IMG_SIZE + draw_offset
    }

    return canvas.toBuffer()
}

async function boxImage(box) {
    const box_rows = chunk(box, 5)

    const canvas = createCanvas(
        (IMG_SIZE * 5) + (draw_offset * 4),
        ((IMG_SIZE * box_rows.length) + (draw_offset * (box_rows.length - 1)))
    )
    const ctx = canvas.getContext("2d")
    let y = 0

    for (const units of box_rows) {
        let x = 0
        for (const ukv of units) {
            if(ukv === null || ukv.unit === undefined)
                continue
            let icon = copy_canvas(await ukv.unit.refresh_icon())
            let ictx = icon.getContext("2d")

            ictx.font = "42px arial"
            ictx.textAlign = "center"
            ictx.fillStyle = "#db1102"

            ictx.fillText(ukv.amount.toString(), ctx.measureText(ukv.amount.toString()).width + 20, 42)
            ctx.drawImage(icon, x, y)
            x += IMG_SIZE + draw_offset
        }
        y += IMG_SIZE + draw_offset
    }

    return canvas.toBuffer()
}

module.exports = {
    banner_rotation_image: banner_rotation_image,
    banner_multi_image: banner_multi_image,
    banner_whale_image: banner_whale_image,
    imageToCanvas: (img) => {
        const canvas = createCanvas(img.width, img.height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(img, 0, 0)
        return canvas.toBuffer()
    },
    boxImage:boxImage,
    teamImage: async (team) => {
        const teamRows = chunk(team, 4)

        const canvas = createCanvas(
            (IMG_SIZE * 4) + (draw_offset * 3),
            ((IMG_SIZE * teamRows.length) + (draw_offset * (teamRows.length - 1)))
        )
        const ctx = canvas.getContext("2d")
        
        let y = 0
        for (const units of teamRows) {
            let x = 0
            for (const unit of units) {
                let icon = copy_canvas(await unit.refresh_icon())

                ctx.drawImage(icon, x, y)

                x += IMG_SIZE + draw_offset
            }
            y += IMG_SIZE + draw_offset
        }

        return canvas.toBuffer()
    }
}