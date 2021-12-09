const sqlite = require("better-sqlite3")
const db = sqlite('./data/data.db')
const unit_helper = require("./units_helper")
let {Unit, Grade, Event, UNIT_LIST, R_UNIT_LIST, SR_UNIT_LIST, unit_by_id} = unit_helper;
const {ALL_BANNER_LIST, Banner, load_banners} = require("./banners_helper");
const {load_frames, Type} = require("./units_helper");

const unit_info_stmt = db.prepare("SELECT unit_id, name, simple_name, type, grade, race, event, affection, icon_path, is_jp, emoji_id, banner FROM units ORDER BY unit_id")
const unit_additional_name_stmt = db.prepare("SELECT name FROM additional_unit_names WHERE unit_id=?")

const affection_stmt = db.prepare("SELECT name FROM affections")

const banner_stmt = db.prepare("SELECT * FROM banners ORDER BY 'order'")
const banner_alt_names_stmt = db.prepare("SELECT alternative_name FROM banner_names WHERE name=?")
const banner_units_stmt = db.prepare("SELECT unit_id FROM banners_units WHERE banner_name=?")
const banner_rated_units_stmt = db.prepare("SELECT unit_id FROM banners_rate_up_units WHERE banner_name=?")

const boxAddQuery = "INSERT INTO box_units (user_id, guild, unit_id, amount) VALUES "
const boxAmountQuery = db.prepare("SELECT amount FROM box_units WHERE user_id=? AND guild=? AND unit_id=?")
const boxQuery = db.prepare("SELECT unit_id, amount FROM box_units WHERE user_id=? AND guild=?")
const boxUpdateQuery = "UPDATE box_units SET amount = (CASE {a}ELSE amount END) WHERE user_id=? AND guild=?"

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
    UNIT_LIST.sort((a, b) => {
        if(a.event === Event.CUSTOM) return -1
        else return 1
    })
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

async function addToBox(boxUser, units) {
    const amount = {}

    const insertParam = []
    const updateParam = []

    let insertQuery = ""
    let updateQuery = ""

    for(const unit of units) {
        if(unit.id in amount)
            amount[unit.id]++
        else
            amount[unit.id] = 1
    }

    for(let [unitID, a] of Object.entries(amount)) {
        unitID = parseInt(unitID)
        const dbAmount = boxAmountQuery.get(boxUser.id, boxUser.guild.id, unitID)

        if(dbAmount === undefined)
            insertParam.push(boxUser.id.toString(), boxUser.guild.id.toString(), unitID, a)
        else {
            updateQuery += `WHEN unit_id = ${unitID} THEN ? `
            updateParam.push(dbAmount.amount + a)
        }
    }

    if(insertParam.length !== 0) {
        insertQuery = "(?,?,?,?),".repeat(insertParam.length/4).slice(undefined, -1)
        const boxAddStmt = db.prepare(boxAddQuery + insertQuery)
        boxAddStmt.run(insertParam)
    }

    if(updateQuery.length === 0) return
    updateParam.push(boxUser.id, boxUser.guild.id)
    const boxUpdateStmt = db.prepare(boxUpdateQuery.replace("{a}", updateQuery))
    boxUpdateStmt.run(updateParam)
}

async function getBox(boxUser) {
    return boxQuery.all(boxUser.id, boxUser.guild.id).map(a => {
        a.unit = unit_by_id(a.unit_id)
        return a
    }).sort((a, b) => {
        if(Grade.toInt(b.unit.grade) > Grade.toInt(a.unit.grade))
            return 1
        else if(Grade.toInt(b.unit.grade) < Grade.toInt(a.unit.grade))
            return -1

        if(b.amount > a.amount)
            return 1
        else if(b.amount < a.amount)
            return -1

        if(Type.toInt(b.unit.type) > Type.toInt(a.unit.type))
            return 1
        else (Type.toInt(b.unit.type) < Type.toInt(a.unit.type))
            return -1
    })
}

module.exports = {
    read_units_from_db: read_units_from_db,
    read_affections_from_db: read_affections_from_db,
    read_banners_from_db: read_banners_from_db,
    addToBox: addToBox,
    getBox: getBox,
    hasBox: boxUser => boxQuery.get(boxUser.id, boxUser.guild.id) !== undefined
}