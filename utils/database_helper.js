const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./data/data.db')
const unit_helper = require("./units_helper")
let {Unit, Grade, UNIT_LIST, R_UNIT_LIST, SR_UNIT_LIST, unit_by_id} = unit_helper;
const {ALL_BANNER_LIST, Banner} = require("./banners_helper");


async function read_units_from_db() {
    UNIT_LIST.length = 0
    R_UNIT_LIST.length = 0
    SR_UNIT_LIST.length = 0

    await new Promise(resolve => {
        db.all("SELECT unit_id, name, simple_name, type, grade, race, event, affection, icon_path, is_jp, emoji_id, banner FROM units ORDER BY unit_id",
            async function (err, u_rows) {
                for(const u_row of u_rows) {
                    let alt_names = await new Promise(resolve1 => {
                        db.all("SELECT name FROM additional_unit_names WHERE unit_id=?", [u_row.unit_id], function (err, rows) {
                            let a = []
                            rows.forEach(n => a.push(n.name))

                            resolve1(a)
                        })
                    })

                    UNIT_LIST.push(new Unit(
                        u_row.unit_id, u_row.name, u_row.simple_name, u_row.type, u_row.grade, u_row.race, u_row.event, u_row.affection,
                        u_row.unit_id < 0 ? u_row.icon_path : "gc/icons/{}.png", alt_names, u_row.is_jp, u_row.emoji_id, u_row.banner === null ? null : u_row.banner.split(",")
                    ))
                }

                resolve(UNIT_LIST)
            }
        )
    })

    R_UNIT_LIST.push([...unit_helper.UNIT_LIST].filter(u => u.grade === Grade.R))
    SR_UNIT_LIST.push([...unit_helper.UNIT_LIST].filter(u => u.grade === Grade.SR))
}

async function read_affections_from_db() {
    unit_helper.ALL_AFFECTIONS = await new Promise(resolve => {
        db.all("SELECT name FROM affections", function (err, rows) {
            let t = unit_helper.ALL_AFFECTIONS

            rows.forEach((row) => {
                unit_helper.ALL_AFFECTIONS.push(row.name)
            })

            resolve(unit_helper.ALL_AFFECTIONS)
        })
    })
}

async function read_banners_from_db() {
    ALL_BANNER_LIST.length = 0

    await new Promise(resolve => {
        db.all("SELECT * FROM banners ORDER BY 'order'",
            async function (err, b_rows) {
                for (const b_row of b_rows) {
                    console.log(b_row)
                    let banner_names = []
                    let unit_list = []
                    let rate_up_unit_list = []

                    await new Promise(resolve1 => {
                        db.all("SELECT alternative_name FROM banner_names WHERE name=?", [b_row.name], function (err, rows) {
                            rows.forEach(n => banner_names.push(n.alternative_name))

                            resolve1(banner_names)
                        })
                    })
                    await new Promise(resolve1 => {
                        db.all("SELECT unit_id FROM banners_units WHERE banner_name=?", [b_row.name], function (err, rows) {
                            rows.forEach(n => unit_list.push(unit_by_id(n.unit_id)))

                            resolve1(unit_list)
                        })
                    })
                    await new Promise(resolve1 => {
                        db.all("SELECT unit_id FROM banners_rate_up_units WHERE banner_name=?", [b_row.name], function (err, rows) {
                            rows.forEach(n => rate_up_unit_list.push(unit_by_id(n.unit_id)))

                            resolve1(rate_up_unit_list)
                        })
                    })

                    banner_names.push(b_row.name)

                    if (unit_list.length === 0)
                        return

                    ALL_BANNER_LIST.push(new Banner(
                        banner_names,
                        b_row.pretty_name,
                        unit_list,
                        rate_up_unit_list,
                        b_row.ssr_unit_rate,
                        b_row.ssr_unit_rate_upped,
                        b_row.sr_unit_rate,
                        b_row.r_unit_rate,
                        b_row.bg_url,
                        b_row.include_all_sr,
                        b_row.include_all_r,
                        b_row.banner_type,
                        b_row.loyality
                    ))

                    console.log(ALL_BANNER_LIST)
                }

                resolve(ALL_BANNER_LIST)
            }
        )
    })

    console.log(ALL_BANNER_LIST)
}

module.exports = {
    read_units_from_db: read_units_from_db,
    read_affections_from_db: read_affections_from_db,
    read_banners_from_db: read_banners_from_db
}