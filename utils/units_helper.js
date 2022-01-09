const axios = require("axios")
const {MessageEmbed} = require("discord.js")
const {IMG_SIZE} = require("./constants")
const {loadImage, createCanvas} = require("canvas")
const {resize_image} = require("./general_helper")

class Grade {
    static get R() {
        return "r"
    }
    static get SR() {
        return "sr"
    }
    static get SSR() {
        return "ssr"
    }

    static toInt(grade) {
        switch (grade) {
            case "r":
                return 0
            case "sr":
                return 1
            case "ssr":
                return 2
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
    static get DARK() {
        return "dark"
    }
    static get LIGHT() {
        return "light"
    }

    static toInt(type) {
        switch (type) {
            case "red":
                return 0
            case "green":
                return 1
            case "blue":
                return 2
            case "dark":
                return 3
            case "light":
                return 4
        }
    }

    static to_discord_color(color) {
        switch (color){
            case "blue":
                return "#2596be"
            case "red":
                return "#ed4e2f"
            case "green":
                return "#339216"
            case "dark":
                return "#2e073b"
            case "light":
                return "#ddaf7d"
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
const ALL_TYPES = [Type.RED, Type.GREEN, Type.BLUE, Type.DARK, Type.LIGHT]
const ALL_EVENT = [Event.BASE_GAME, Event.SLIME, Event.AOT, Event.KOF, Event.FESTIVAL, Event.NEW_YEAR,
    Event.VALENTINE, Event.HALLOWEEN, Event.REZERO, Event.STRANGER_THINGS, Event.RAGNAROK]
let ALL_AFFECTIONS = [Affection.SINS, Affection.COMMANDMENTS, Affection.CATASTROPHES, Affection.ANGEL,
    Affection.KNIGHT, Affection.NONE]

let UNIT_LIST = []
let R_UNIT_LIST = []
let SR_UNIT_LIST = []

let FRAMES = {}
let FRAME_BG = {}

async function load_frames() {
    FRAMES = {
        "blue": {
            "R": resize_image(await loadImage("data/gc/frames/blue_r_frame.png"), IMG_SIZE, IMG_SIZE),
            "SR": resize_image(await loadImage("data/gc/frames/blue_sr_frame.png"), IMG_SIZE, IMG_SIZE),
            "SSR":  resize_image(await loadImage("data/gc/frames/blue_ssr_frame.png"), IMG_SIZE, IMG_SIZE)
        },
        "red": {
            "R":  resize_image(await loadImage("data/gc/frames/red_r_frame.png"), IMG_SIZE, IMG_SIZE),
            "SR":  resize_image(await loadImage("data/gc/frames/red_sr_frame.png"), IMG_SIZE, IMG_SIZE),
            "SSR":  resize_image(await loadImage("data/gc/frames/red_ssr_frame.png"), IMG_SIZE, IMG_SIZE),
        },
        "green": {
            "R":  resize_image(await loadImage("data/gc/frames/green_r_frame.png"), IMG_SIZE, IMG_SIZE),
            "SR":  resize_image(await loadImage("data/gc/frames/green_sr_frame.png"), IMG_SIZE, IMG_SIZE),
            "SSR":  resize_image(await loadImage("data/gc/frames/green_ssr_frame.png"), IMG_SIZE, IMG_SIZE),
        }
    }

    FRAME_BG = {
        "R": resize_image(await loadImage("data/gc/frames/r_frame_background.png"), IMG_SIZE, IMG_SIZE),
        "SR": resize_image(await loadImage("data/gc/frames/sr_frame_background.png"), IMG_SIZE, IMG_SIZE),
        "SSR": resize_image(await loadImage("data/gc/frames/ssr_frame_background.png"), IMG_SIZE, IMG_SIZE),
    }
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
        if (this.id < 0) {
            const response = await axios.get(this.icon_path, {responseType: 'arraybuffer'})
            this.icon = resize_image(await loadImage(Buffer.from(response.data, "utf-8")), IMG_SIZE, IMG_SIZE)
        }

        return this.icon
    }

    async set_icon() {
        if (this.id > 0) {
            let canvas = createCanvas(IMG_SIZE, IMG_SIZE)
            let ctx = canvas.getContext("2d")
            this.icon = await loadImage(this.icon_path)

            ctx.save()
            ctx.scale(IMG_SIZE / this.icon.width, IMG_SIZE / this.icon.height)
            ctx.drawImage(this.icon, 0, 0)
            ctx.restore()

            this.icon = canvas
        }

        return this
    }
}

function unit_by_id(id) {
    return UNIT_LIST.find(u => {
        return u.id == id
    })
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

function longest_named_unit(samples = []) {
    if(samples.length === 0) samples = UNIT_LIST.slice()
    samples = samples.slice()

    samples.sort((a, b) => {
        return a.name.length - b.name.length
    })

    return samples[0]
}

module.exports = {
    ALL_RACES: ALL_RACES,
    ALL_TYPES: ALL_TYPES,
    ALL_GRADES: ALL_GRADES,
    ALL_EVENT: ALL_EVENT,
    ALL_AFFECTIONS: ALL_AFFECTIONS,
    UNIT_LIST: UNIT_LIST,
    R_UNIT_LIST: R_UNIT_LIST,
    SR_UNIT_LIST: SR_UNIT_LIST,
    FRAMES: FRAMES,
    FRAME_BG: FRAME_BG,
    Grade: Grade,
    Race: Race,
    Event: Event,
    Type: Type,
    Unit: Unit,
    unit_by_id: unit_by_id,
    units_by_id: units_by_id,
    unit_by_name: unit_by_name,
    unit_by_vague_name: unit_by_vague_name,
    longest_named_unit: longest_named_unit,
    load_frames: load_frames,
    mapAttribute: att => {
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
            case "dark":
            case "d":
                return Type.DARK
            case "light":
            case "l":
                return Type.LIGHT
        }
    },
    mapGrade: grade => {
        grade = grade.toLowerCase()
        switch (grade) {
            case "r":
                return Grade.R
            case "sr":
                return Grade.SR
            case "ssr":
                return Grade.SSR
        }
    },
    mapRace: race => {
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
    },
    mapEvent: event => {
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
            default:
                return Event.BASE_GAME
        }
    },
    mapAffection: aff => {
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
    },

}