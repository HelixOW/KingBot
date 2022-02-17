import { Unit, Grade, Event, unitById, load_frames, Type, Race, Affection, rUnitList, srUnitList, unitList } from './units';
import { allBannerList, Banner, loadBanners } from "./banners";
import { GuildMember } from 'discord.js';
import UserProfile from './user_profiles';

const sqlite = require("better-sqlite3")
const db = sqlite('./data/data.db')

function tableCreate(name: string, extra: string, ...fields: string[]) {
    return "CREATE TABLE IF NOT EXISTS " + name + " (" + fields.join(",") + ")" + (extra.length !== 0 ? " " + extra : "") + ";"
}

const unitStatement = {
    info: db.prepare("SELECT unit_id, name, simple_name, type, grade, race, event, affection, icon_path, is_jp, emoji_id, banner FROM units ORDER BY unit_id"),
    additionalName: db.prepare("SELECT name FROM additional_unit_names WHERE unit_id=?")
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

const profileData = {
    create: {
        profiles: db.prepare(tableCreate("profiles", "",
            "discord_id INTEGER PRIMARY KEY",
            "multis INTEGER DEFAULT 0",
            "singles INTEGER DEFAULT 0")),
        
        gameUnits: db.prepare(tableCreate("game_units", "", 
            "discord_id INTEGER NOT NULL",
            "unit INTEGER NOT NULL",
            "level INTEGER DEFAULT 0",
            "awakening INTEGER DEFAULT 0",
            "super_awakening INTEGER DEFAULT 0",
            "cc INTEGER DEFAULT 0")),

        demonTeams: db.prepare(tableCreate("demon_teams", "",
            "discord_id INTEGER NOT NULL",
            "demon TEXT NOT NULL",
            "place_a INTEGER NOT NULL",
            "place_b INTEGER NOT NULL",
            "place_c INTEGER NOT NULL",
            "place_d INTEGER NOT NULL",
            "link_a INTEGER",
            "link_b INTEGER",
            "link_c INTEGER",
            "link_d INTEGER"))
    },

    select: {
        profileByUser: db.prepare("SELECT multis, singles FROM profiles WHERE discord_id=?"),
        demonTeamByDemonAndUser: db.prepare("SELECT place_a, place_b, place_c, place_d, sub_a, sub_b, sub_c, sub_d FROM demon_teams WHERE demon=? AND discord_id=?"),
        demonTeamsByUser: db.prepare("SELECT demon, place_a, place_b, place_c, place_d, sub_a, sub_b, sub_c, sub_d FROM demon_teams WHERE discord_id=?")
    }
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
            addNames, 
            Type.fromString(unit.type),
            Grade.fromString( unit.grade), 
            Race.fromString(unit.race), 
            Event.fromString(unit.event), 
            Affection.fromString(unit.affection),
            unit.unit_id < 0 ? unit.icon_path : "data/gc/icons/{}.png",
            unit.is_jp, 
            unit.emoji_id, 
            unit.banner === null ? [] : unit.banner.replace("part 1", "general").replace("part 2", "general").replace("part 3", "general").split(",")
        ).updateIcon())
    }

    unitList.filter(u => u.grade === Grade.R && u.event === Event.BASE_GAME).forEach(u => rUnitList.set(u.id, u))
    unitList.filter(u => u.grade === Grade.SR && u.event === Event.BASE_GAME).forEach(u => srUnitList.set(u.id, u))

    await load_frames()
    unitList.sort((a: Unit, b: Unit) => {
        if(a.event === Event.CUSTOM) return -1
        else return 1
    })

    return true
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

export function initiateProfileTable() {
    profileData.create.profiles.run()
}

export function getProfile(person: GuildMember): UserProfile {
    const profile: {multis: number, singles: number} = profileData.select.profileByUser.get(person.id)
    const boxData: {unit_id: number, amount: number, unit: Unit}[] = getBox(person)
    const demonData: {
        demon: string, place_a: number, place_b: number, place_c: number, place_d: number, sub_a: number, sub_b: number, sub_c: number, sub_d: number
    } = profileData.select.demonTeamsByUser.get(person.id)
    
}