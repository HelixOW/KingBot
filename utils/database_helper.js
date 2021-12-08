const sqlite = require("better-sqlite3")
const db = sqlite('./data/data.db')
const unit_helper = require("./units_helper")
let {Unit, Grade, Event, UNIT_LIST, R_UNIT_LIST, SR_UNIT_LIST, unit_by_id} = unit_helper;
const {ALL_BANNER_LIST, Banner, load_banners} = require("./banners_helper");
const {load_frames} = require("./units_helper");

const unit_info_stmt = db.prepare("SELECT unit_id, name, simple_name, type, grade, race, event, affection, icon_path, is_jp, emoji_id, banner FROM units ORDER BY unit_id")
const unit_additional_name_stmt = db.prepare("SELECT name FROM additional_unit_names WHERE unit_id=?")

const affection_stmt = db.prepare("SELECT name FROM affections")

const banner_stmt = db.prepare("SELECT * FROM banners ORDER BY 'order'")
const banner_alt_names_stmt = db.prepare("SELECT alternative_name FROM banner_names WHERE name=?")
const banner_units_stmt = db.prepare("SELECT unit_id FROM banners_units WHERE banner_name=?")
const banner_rated_units_stmt = db.prepare("SELECT unit_id FROM banners_rate_up_units WHERE banner_name=?")

async function read_units_from_db() {
    UNIT_LIST.length = 0
    R_UNIT_LIST.length = 0
    SR_UNIT_LIST.length = 0

    for (const unit of unit_info_stmt.all()) {
        const add_names = unit_additional_name_stmt.all(unit.id).map(data => data.name)

        UNIT_LIST.push(await new Unit(
            unit.unit_id, unit.name, unit.simple_name, unit.type, unit.grade, unit.race, unit.event, unit.affection,
            unit.unit_id < 0 ? unit.icon_path : "data/gc/icons/{}.png", add_names, unit.is_jp, unit.emoji_id, unit.banner === null ? [] : unit.banner.replace("part 1", "general").replace("part 2", "general").replace("part 3", "general").split(",")
        ).set_icon())
    }

    R_UNIT_LIST.push(...UNIT_LIST.filter(u => u.grade === Grade.R && u.event === Event.BASE_GAME))
    SR_UNIT_LIST.push(...UNIT_LIST.filter(u => u.grade === Grade.SR && u.event === Event.BASE_GAME))

    await load_frames()
}

function read_affections_from_db() {
    unit_helper.ALL_AFFECTIONS.push(...affection_stmt.all().map(data => data.name))
}

async function read_banners_from_db() {
    ALL_BANNER_LIST.length = 0

    for(const banner of banner_stmt.all()) {
        const banner_names = banner_alt_names_stmt.all(banner.name).map(data => data.alternative_name)
        const banner_units = banner_units_stmt.all(banner.name).map(data => unit_by_id(data.unit_id))
        const banner_rated_units = banner_rated_units_stmt.all(banner.name).map(data => unit_by_id(data.unit_id))

        banner_names.push(banner.name)

        ALL_BANNER_LIST.push(await new Banner(
            banner_names,
            banner.pretty_name,
            banner_units,
            banner_rated_units,
            banner.ssr_unit_rate,
            banner.ssr_unit_rate_upped,
            banner.sr_unit_rate,
            banner.r_unit_rate,
            banner.bg_url,
            banner.include_all_sr,
            banner.include_all_r,
            banner.banner_type,
            banner.loyality,
            banner.order
        ).load_unit_list_image())
    }

    ALL_BANNER_LIST.sort((a, b) => a.order - b.order)

    await load_banners()
}

module.exports = {
    read_units_from_db: read_units_from_db,
    read_affections_from_db: read_affections_from_db,
    read_banners_from_db: read_banners_from_db
}