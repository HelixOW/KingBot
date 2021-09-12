const fs = require("fs");
const axios = require("axios")
const jimp = require("jimp")
const {MessageEmbed} = require("discord.js");
const {IMG_SIZE} = require("./constants");

class Grade {
    static get R() {
        return "R"
    }
    static get SR() {
        return "SR"
    }
    static get SSR() {
        return "SSR"
    }

    static to_int(grade) {
        switch (grade) {
            case "R":
                return 2
            case "SR":
                return 1
            case "SSR":
                return 0
        }
    }
}

class Type {
    static get RED() {
        return "red"
    }
    static get GREEN() {
        return "green"
    }
    static get BLUE() {
        return "blue"
    }

    static to_discord_color(color) {
        switch (color){
            case "blue":
                return "#2596be"
            case "red":
                return "#ed4e2f"
            case "green":
                return "#339216"
        }
    }
}

class Race {
    static get DEMON() {
        return "demon"
    }
    static get GIANT() {
        return "giant"
    }
    static get HUMAN() {
        return "human"
    }
    static get FAIRY() {
        return "fairy"
    }
    static get GODDESS() {
        return "goddess"
    }
    static get UNKNOWN() {
        return "unknown"
    }
}

class Event {
    static get BASE_GAME() {
        return "gc"
    }
    static get SLIME() {
        return "slime"
    }
    static get AOT() {
        return "aot"
    }
    static get KOF() {
        return "kof"
    }
    static get NEW_YEAR() {
        return "newyear"
    }
    static get HALLOWEEN() {
        return "halloween"
    }
    static get FESTIVAL() {
        return "festival"
    }
    static get VALENTINE() {
        return "valentine"
    }
    static get REZERO() {
        return "rezero"
    }
    static get STRANGER_THINGS() {
        return "stranger"
    }
    static get RAGNAROK() {
        return "ragnarok"
    }
    static get CUSTOM() {
        return "custom"
    }
}

class Affection {
    static get SINS() {
        return "sins"
    }
    static get COMMANDMENTS() {
        return "commandments"
    }
    static get KNIGHT() {
        return "holyknights"
    }
    static get CATASTROPHES() {
        return "catastrophes"
    }
    static get ANGEL() {
        return "archangels"
    }
    static get NONE() {
        return "none"
    }
}

const ALL_RACES = [Race.DEMON, Race.GIANT, Race.HUMAN, Race.FAIRY, Race.GODDESS, Race.UNKNOWN]
const ALL_GRADES = [Grade.R, Grade.SR, Grade.SSR]
const ALL_TYPES = [Type.RED, Type.GREEN, Type.BLUE]
const ALL_EVENT = [Event.BASE_GAME, Event.SLIME, Event.AOT, Event.KOF, Event.FESTIVAL, Event.NEW_YEAR,
    Event.VALENTINE, Event.HALLOWEEN, Event.REZERO, Event.STRANGER_THINGS, Event.RAGNAROK]
let ALL_AFFECTIONS = [Affection.SINS, Affection.COMMANDMENTS, Affection.CATASTROPHES, Affection.ANGEL,
    Affection.KNIGHT, Affection.NONE]

let UNIT_LIST = []
let R_UNIT_LIST = []
let SR_UNIT_LIST = []

const FRAMES = {
    "blue": {
        "R": jimp.read("gc/frames/blue_r_frame.png").then(i => i.resize(IMG_SIZE, IMG_SIZE).rgba(true)),
        "SR": jimp.read("gc/frames/blue_sr_frame.png").then(i => i.resize(IMG_SIZE, IMG_SIZE).rgba(true)),
        "SSR": jimp.read("gc/frames/blue_ssr_frame.png").then(i => i.resize(IMG_SIZE, IMG_SIZE).rgba(true))
    },
    "red": {
        "R": jimp.read("gc/frames/red_r_frame.png").then(i => i.resize(IMG_SIZE, IMG_SIZE).rgba(true)),
        "SR": jimp.read("gc/frames/red_sr_frame.png").then(i => i.resize(IMG_SIZE, IMG_SIZE).rgba(true)),
        "SSR": jimp.read("gc/frames/red_ssr_frame.png").then(i => i.resize(IMG_SIZE, IMG_SIZE).rgba(true)),
    },
    "green": {
        "R": jimp.read("gc/frames/green_r_frame.png").then(i => i.resize(IMG_SIZE, IMG_SIZE).rgba(true)),
        "SR": jimp.read("gc/frames/green_sr_frame.png").then(i => i.resize(IMG_SIZE, IMG_SIZE).rgba(true)),
        "SSR": jimp.read("gc/frames/green_ssr_frame.png").then(i => i.resize(IMG_SIZE, IMG_SIZE).rgba(true)),
    }
}
const FRAME_BG = {
    "R": jimp.read("gc/frames/r_frame_background.png").then(i => i.resize(IMG_SIZE, IMG_SIZE).rgba(true)),
    "SR": jimp.read("gc/frames/sr_frame_background.png").then(i => i.resize(IMG_SIZE, IMG_SIZE).rgba(true)),
    "SSR": jimp.read("gc/frames/ssr_frame_background.png").then(i => i.resize(IMG_SIZE, IMG_SIZE).rgba(true)),
}

function map_attribute(att) {
    att = att.toLowerCase()
    switch (att) {
        case "blue":
        case "speed":
        case "b":
            return Type.BLUE
        case "red":
        case "strength":
        case "r":
            return Type.RED
        case "green":
        case "hp":
        case "g":
            return Type.GREEN
    }
}

function map_grade(grade) {
    grade = grade.toLowerCase()
    switch (grade) {
        case "r":
            return Grade.R
        case "sr":
            return Grade.SR
        case "ssr":
            return Grade.SSR
    }
}

function map_race(race) {
    race = race.toLowerCase()
    switch (race) {
        case "demon":
        case "demons":
            return Race.DEMON
        case "giant":
        case "giants":
            return Race.GIANT
        case "fairy":
        case "fairies":
            return Race.FAIRY
        case "human":
        case "humans":
            return Race.HUMAN
        case "goddess":
        case "god":
        case "gods":
            return Race.GODDESS
        case "unknown":
        case "?":
        case "unknowns":
            return Race.UNKNOWN
    }
}

function map_event(event) {
    event = event.replace(" ", "").toLowerCase()
    switch (event) {
        case "slime":
        case "tensura":
            return Event.SLIME
        case "aot":
        case "attackontitan":
            return Event.AOT
        case "kof":
        case "kingoffighters":
        case "kingoffighter":
            return Event.KOF
        case "val":
        case "valentine":
            return Event.VALENTINE
        case "ny":
        case "newyear":
        case "newyears":
            return Event.NEW_YEAR
        case "hw":
        case "hal":
        case "halloween":
            return Event.HALLOWEEN
        case "fes":
        case "fest":
        case "festival":
            return Event.FESTIVAL
        case "re":
        case "zero":
        case "rezero":
            return Event.REZERO
        case "custom":
            return Event.CUSTOM
        case "stranger":
        case "strangerthings":
        case "st":
        case "things":
            return Event.STRANGER_THINGS
        case "ragnarok":
        case "ragna":
        case "rok":
            return Event.RAGNAROK
    }
}

function map_affection(aff) {
    aff = aff.replace(" ", "").toLowerCase()
    switch (aff) {
        case "sins":
        case "sin":
            return Affection.SINS
        case "holyknight":
        case "holyknights":
        case "knight":
        case "knights":
            return Affection.KNIGHT
        case "commandments":
        case "commandment":
            return Affection.COMMANDMENTS
        case "catastrophes":
        case "catastrophe":
            return Affection.CATASTROPHES
        case "archangels":
        case "archangel":
        case "angels":
        case "angel":
            return Affection.ANGEL
        case "none":
        case "no":
            return Affection.NONE
    }
    return Affection.NONE
}
/*
function compose_icon(attribute, grade, background = null) {
    bg_frame = FRAME_BG[grade].copy()
    if(background === null)
        background = bg_frame
    else
        background = background
}*/

class Unit {
    constructor(id, name, simple_name, type, grade, race, event = Event.BASE_GAME,
                affection = Affection.NONE,
                icon_path = "gc/icons/{}.png", alt_names = [], jp = false, emoji, home_banner = []) {
        this.id = id
        this.name = name
        this.simple_name = simple_name
        this.type = type
        this.grade = grade
        this.race = race
        this.event = event
        this.affection = affection
        this.icon_path = icon_path.replace("{}", this.id)
        this.jp = jp
        this.emoji = `<:${this.id > 9 ? this.id : "0" + this.id}:${emoji}>`
        this.home_banners = home_banner
        this.alt_names = alt_names

        let icon = null

        if (this.id > 0) {
            fs.readFile(icon_path.replace("{}", this.id), function (err, data) {
                icon = data
            })
            this.icon = icon
        }
    }

    info_embed() {
        const embed = new MessageEmbed()
            .setTitle(this.name)
            .setColor(Type.to_discord_color(this.type))

        if(this.alt_names.length > 0)
            embed.addField("Alternative Names", `\`\`\`${this.alt_names.join(",\n")}\`\`\``, true)

        embed.addField("Type", `\`\`\`${this.type}\`\`\``, true)
            .addField("Grade", `\`\`\`${this.grade}\`\`\``, true)
            .addField("Race", `\`\`\`${this.race}\`\`\``, true)
            .addField("Event", `\`\`\`${this.event}\`\`\``, true)
            .addField("Affection", `\`\`\`${this.affection}\`\`\``, true)
            .addField("JP", `\`\`\`${this.jp ? "Yes" : "No"}\`\`\``, true)
            .addField("ID", `\`\`\`${this.id}\`\`\``, true)
            .addField("Emoji", `\`\`\`${this.emoji}\`\`\``, true)

        embed.setThumbnail(`attachment://${this.id}.png`)

        return embed
    }

    async refresh_icon() {
        if(this.id > 0) return this.icon
        const response = await axios.get(this.icon_path, {responseType: 'arraybuffer'})
        this.icon = Buffer.from(response.data, "utf-8")
    }

    async set_icon() {

    }
}

function unit_by_id(id) {
    return UNIT_LIST.find((u) => u.id == id)
}

function units_by_id(id) {
    return UNIT_LIST.filter((u) => u.id == id)
}

function unit_by_name(name) {
    return UNIT_LIST.find((u) => u.name === name)
}

/**
 *
 * @param name
 * @param sample_list
 * @returns {Unit[]}
 */
function unit_by_vague_name(name, sample_list = UNIT_LIST) {
    name = name.toLowerCase().trim()

    return sample_list.filter((u) => {
        return (u.alt_names !== null ? u.alt_names.includes(name) : false) || u.name.toLowerCase().includes(` ${name}`)
    })
}

module.exports = {
    ALL_AFFECTIONS: ALL_AFFECTIONS,
    UNIT_LIST: UNIT_LIST,
    R_UNIT_LIST: R_UNIT_LIST,
    SR_UNIT_LIST: SR_UNIT_LIST,
    FRAMES: FRAMES,
    FRAME_BG: FRAME_BG,
    Grade: Grade,
    Event: Event,
    Unit: Unit,
    unit_by_id: unit_by_id,
    units_by_id: units_by_id,
    unit_by_name: unit_by_name,
    unit_by_vague_name: unit_by_vague_name
}