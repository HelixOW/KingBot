const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./data/data.db')
const units = require("./units")
const {UNIT_LIST, R_UNIT_LIST, SR_UNIT_LIST} = require("./units");

let {Unit, Grade} = units


async function read_units_from_db() {
    UNIT_LIST.length = 0
    R_UNIT_LIST.length = 0
    SR_UNIT_LIST.length = 0

    await new Promise(resolve => {
        db.all("SELECT unit_id, name, simple_name, type, grade, race, event, affection, icon_path, is_jp, emoji_id, new_column, banner FROM units ORDER BY unit_id",
            function (err, u_rows) {
                u_rows.forEach(async (u_row) => {
                    let alt_names = []

                    await new Promise(resolve1 => {
                        db.all("SELECT name FROM additional_unit_names WHERE unit_id=?", [u_row.unit_id], function (err, rows) {
                            rows.forEach(n => alt_names.push(n.name))

                            resolve1(alt_names)
                        })
                    })

                    UNIT_LIST.push(new Unit(
                        u_row.unit_id, u_row.name, u_row.simple_name, u_row.type, u_row.grade, u_row.race, u_row.event, u_row.affection,
                        u_row.unit_id < 0 ? u_row.icon_path : "gc/icons/{}.png", alt_names, u_row.is_jp, u_row.emoji_id, u_row.banner === null ? null : u_row.banner.split(",")
                    ))
                })

                resolve(UNIT_LIST)
            }
        )
    })

    R_UNIT_LIST.push([...units.UNIT_LIST].filter(u => u.grade === Grade.R))
    SR_UNIT_LIST.push([...units.UNIT_LIST].filter(u => u.grade === Grade.SR))
}

async function read_affections_from_db() {
    units.ALL_AFFECTIONS = await new Promise(resolve => {
        db.all("SELECT name FROM affections", function (err, rows) {
            let t = units.ALL_AFFECTIONS

            rows.forEach((row) => {
                units.ALL_AFFECTIONS.push(row.name)
            })

            resolve(units.ALL_AFFECTIONS)
        })
    })
}

module.exports = {
    read_units_from_db: read_units_from_db,
    read_affections_from_db: read_affections_from_db
}