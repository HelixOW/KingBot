import { Unit, Grade, Event, unitById, load_frames, Type, Race, Affection, rUnitList, srUnitList, unitList } from './units';
import { allBannerList, Banner, loadBanners } from "./banners";
import { GuildMember } from 'discord.js';

const sqlite = require("better-sqlite3")
const db = sqlite('./data/data.db')

const unitStatement = {
    info: db.prepare("SELECT unit_id, name, simple_name, variation, type, grade, race, event, affection, emoji_id, banner FROM units ORDER BY unit_id"),
    additionalName: db.prepare("SELECT name FROM additional_unit_names WHERE unit_id=?"),
    latestId: db.prepare("SELECT unit_id FROM units ORDER BY unit_id DESC"),
    add: db.prepare("INSERT INTO units (unit_id, name, simple_name, variation, type, grade, race, event, affection, emoji_id, banner) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
}

const bannerStatement = {
    info: db.prepare("SELECT * FROM banners ORDER BY 'order'"),
    altNames: db.prepare("SELECT alternative_name FROM banner_names WHERE name=?"),
    units: db.prepare("SELECT unit_id FROM banners_units WHERE banner_name=?"),
    ratedUpUnits:db.prepare("SELECT unit_id FROM banners_rate_up_units WHERE banner_name=?")
}

const boxStatement = {
    add: "INSERT INTO box_units (user_id, guild, unit_id, amount) VALUES ",
    amount: db.prepare("SELECT amount FROM box_units WHERE user_id=? AND guild=? AND unit_id=?"),
    info: db.prepare("SELECT unit_id, amount FROM box_units WHERE user_id=? AND guild=?"),
    update: "UPDATE box_units SET amount = (CASE {a}ELSE amount END) WHERE user_id=? AND guild=?"
}

export async function readUnitsFromDatabase(): Promise<boolean> {
    unitList.clear()
    rUnitList.clear()
    srUnitList.clear()
    
    for (const unit of unitStatement.info.all()) {
        const addNames = unitStatement.additionalName.all(unit.id).map((data: {name: string}) => data.name)

        unitList.set(unit.unit_id, await new Unit(
            unit.unit_id,
            unit.name, 
            unit.simple_name,
            unit.variation,
            addNames, 
            Type.fromString(unit.type),
            Grade.fromString( unit.grade), 
            Race.fromString(unit.race), 
            Event.fromString(unit.event), 
            Affection.fromString(unit.affection),
            unit.emoji_id, 
            unit.banner === null ? [] : unit.banner.replace("part 1", "general").replace("part 2", "general").replace("part 3", "general").split(",")
        ).updateIcon())
    }

    unitList.filter(u => u.grade === Grade.R && u.event === Event.BASE_GAME).forEach(u => rUnitList.set(u.id, u))
    unitList.filter(u => u.grade === Grade.SR && u.event === Event.BASE_GAME).forEach(u => srUnitList.set(u.id, u))

    //await load_frames()
    unitList.sort((a: Unit, b: Unit) => {
        if(a.event === Event.CUSTOM) return -1
        else return 1
    })

    return true
}

export async function registerNewUnit(unit: Unit, event: String, affection: String) {
    unitList.set(unit.id, unit)
    unitStatement.add.run(
        unit.id,
        unit.name, unit.simpleName, unit.variationName,
        unit.type.toString(), unit.grade.toString(), unit.race.toString(), event, affection,
        "", null
    )
}

export function latestUnitId() {
    return unitStatement.latestId.get().unit_id
}

export async function readBannersFromDatabase(): Promise<void> {
    allBannerList.clear()

    for(const banner of bannerStatement.info.all()) {
        const bannerNames = bannerStatement.altNames.all(banner.name).map(data => data.alternative_name)
        const bannerUnits = bannerStatement.units.all(banner.name).map(data => unitById(data.unit_id))
        const bannerRatedUpUnits = bannerStatement.ratedUpUnits.all(banner.name).map(data => unitById(data.unit_id))

        bannerNames.push(banner.name)

        allBannerList.set(banner.name, await new Banner(
            bannerNames,
            banner.pretty_name,
            bannerUnits,
            bannerRatedUpUnits,
            banner.ssr_unit_rate,
            banner.ssr_unit_rate_upped,
            banner.sr_unit_rate,
            banner.r_unit_rate,
            banner.bg_url,
            banner.include_all_sr === 1,
            banner.include_all_r === 1,
            banner.banner_type,
            banner.loyality,
            banner.order
        ).loadUnitListImage())
    }

    allBannerList.sort((a, b) => a.order - b.order)

    await loadBanners()
}

export function addToBox(boxUser: GuildMember, units: Unit[]) {
    const amount: Map<number, number> = new Map()

    const insertParam = []
    const updateParam = []

    let insertQuery = ""
    let updateQuery = ""

    for(const unit of units) {
        if(unit.id in amount)
            amount.set(unit.id, amount.get(unit.id) + 1)
        else
            amount.set(unit.id, 1)
    }

    for(let [unitId, a] of amount) {
        const dbAmount = boxStatement.amount.get(boxUser.id, boxUser.guild.id, unitId)

        if(dbAmount === undefined)
            insertParam.push(boxUser.id.toString(), boxUser.guild.id.toString(), unitId, a)
        else {
            updateQuery += `WHEN unit_id = ${unitId} THEN ? `
            updateParam.push(dbAmount.amount + a)
        }
    }

    if(insertParam.length !== 0) {
        insertQuery = "(?,?,?,?),".repeat(insertParam.length/4).slice(undefined, -1)
        const boxAddStmt = db.prepare(boxStatement.add + insertQuery)
        boxAddStmt.run(insertParam)
    }

    if(updateQuery.length === 0) return
    updateParam.push(boxUser.id, boxUser.guild.id)
    const boxUpdateStmt = db.prepare(boxStatement.update.replace("{a}", updateQuery))
    boxUpdateStmt.run(updateParam)
}

export function hasBox(boxUser: GuildMember): boolean {
    return boxStatement.info.get(boxUser.id, boxUser.guild.id) !== undefined
}

export function getBox(boxUser: GuildMember): {unit_id: number, amount: number, unit: Unit}[] {
    return boxStatement.info.all(boxUser.id, boxUser.guild.id).map((a: {unit_id: number, amount: number, unit: Unit}) => {
        if(a.unit_id === null)
            return null
        let u = unitById(a.unit_id)
        if(u !== null)
            a.unit = u
        return a
    }).sort((a, b) => {
        if(a === null || b === null)
            return 0
        if(b.unit.grade.toInt() > a.unit.grade.toInt())
            return 1
        else if(b.unit.grade.toInt() < a.unit.grade.toInt())
            return -1

        if(b.amount > a.amount)
            return 1
        else if(b.amount < a.amount)
            return -1

        if(b.unit.type.toInt() > a.unit.type.toInt())
            return 1
        else (b.unit.type.toInt() < a.unit.type.toInt())
            return -1
    })
}