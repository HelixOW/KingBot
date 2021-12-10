const units_helper = require("./units_helper")
const {Grade, UNIT_LIST, Event} = units_helper
const {remove_items, IMG_SIZE} = require("./constants")
const {getRandomArbitrary, getRandomInt, chunk} = require("./general_helper")
const {createCanvas} = require("canvas")
const {longest_named_unit} = require("./units_helper")

class Banner {
    constructor(
        name,
        pretty_name,
        units,
        rate_up_units = [],
        ssr_unit_rate,
        ssr_unit_rate_up = 0.5,
        sr_unit_rate,
        r_unit_rate = 6.6667,
        bg_url,
        include_all_sr = true,
        include_all_r = true,
        banner_type = 11,
        loyalty = 900,
        order
    ) {
        this.unique_name = name[0]
        this.names = name
        this.pretty_name = pretty_name
        this.banner_type = banner_type
        this.background = bg_url
        this.shaftable = this.names.filter(n => n.includes("gssr")).length === 0
        this.loyalty = loyalty
        this.order = order

        this.include_all_sr = include_all_sr
        this.include_all_r = include_all_r

        this.units = units

        if (sr_unit_rate !== 0 && include_all_sr)
            this.units.push(...units_helper.SR_UNIT_LIST)
        if (r_unit_rate !== 0 && include_all_r) 
            this.units.push(...units_helper.R_UNIT_LIST)

        this.rate_up_units = rate_up_units

        this.r_units = this.units.filter(u => u.grade === Grade.R)
        this.sr_units = this.units.filter(u => u.grade === Grade.SR)

        this.ssr_units = this.units.filter(u => u.grade === Grade.SSR && !this.rate_up_units.includes(u))
        this.all_ssr_units = this.units.filter(u => u.grade === Grade.SSR)
        this.all_units = this.rate_up_units.concat(this.units)

        this.ssr_unit_rate = ssr_unit_rate
        this.ssr_unit_rate_up = ssr_unit_rate_up
        this.sr_unit_rate = sr_unit_rate
        this.r_unit_rate = r_unit_rate

        this.ssr_chance = (this.ssr_unit_rate_up * this.rate_up_units.length) + (this.ssr_unit_rate * this.ssr_units.length)
        this.ssr_rate_up_chance = this.rate_up_units.length !== 0 ? (this.ssr_unit_rate_up * this.rate_up_units) : 0
        this.sr_chance = this.sr_unit_rate * this.sr_units.length

        this.unit_list_image = []
    }

    async reload(new_units) {
        this.units = new_units

        this.r_units = this.units.filter(u => u.grade === Grade.R)
        this.sr_units = this.units.filter(u => u.grade === Grade.SR)

        this.ssr_units = this.units.filter(u => u.grade === Grade.SSR && !this.rate_up_units.includes(u))
        this.all_ssr_units = this.units.filter(u => u.grade === Grade.SSR)
        this.all_units = this.rate_up_units.concat(this.units)

        this.ssr_chance = (this.ssr_unit_rate_up * this.rate_up_units.length) + (this.ssr_unit_rate * this.ssr_units.length)
        this.sr_chance = this.sr_unit_rate * this.sr_units.length

        await this.load_unit_list_image()
    }

    hasUnit(possible_units) {
        return this.all_units.map(u => u.id).some(r => possible_units.map(u => u.id).includes(r))
    }

    get_unit_rate(unit) {
        if (this.rate_up_units.includes(unit))
            return this.ssr_unit_rate_up
        else if (this.ssr_units.includes(unit))
            return this.ssr_unit_rate
        else if (this.sr_units.includes(unit))
            return this.sr_unit_rate
        else if (this.r_units.includes(unit))
            return this.r_unit_rate
    }

    async unit_by_chance() {
        const draw_chance = getRandomArbitrary(0, 100).toFixed(4)

        let u

        if (this.ssr_rate_up_chance >= draw_chance && this.rate_up_units.length !== 0) {
            u = this.rate_up_units[getRandomInt(0, this.rate_up_units.length)]
        }
        else if (this.ssr_chance >= draw_chance || this.sr_units.length === 0) {
            u = this.ssr_units[getRandomInt(0, this.ssr_units.length)]
        }
        else if (this.sr_chance >= draw_chance || this.r_units.length === 0) {
            u = this.sr_units[getRandomInt(0, this.sr_units.length)]
        }
        else {
            u = this.r_units[getRandomInt(0, this.r_units.length)]
        }

        return u
    }

    async load_unit_list_image() {
        if(this.all_ssr_units.length === 0) {
            this.unit_list_image = [createCanvas(IMG_SIZE, IMG_SIZE)]
            return this
        }

        const chunked_units = chunk(this.all_units, 5)
        const banner_unit_list = []

        for(const units of chunked_units) {
            let canvas = createCanvas(0, 0)
            let ctx = canvas.getContext("2d")

            canvas.width = IMG_SIZE + ctx.measureText(longest_named_unit(units).name + " - 99.9999%").width + 5
            canvas.height = (IMG_SIZE * units.length) + (9 * (units.length - 1))

            ctx = canvas.getContext("2d")

            let y = 0
            for(const unit of units) {
                ctx.drawImage(await unit.refresh_icon(), 0, y)

                ctx.font = "42px arial"
                ctx.textAlign = "center"
                ctx.fillStyle = "#000000"
                ctx.shadowBlur = 10
                ctx.shadowColor = "#000000"

                let text = unit.name + " - " + this.get_unit_rate(unit)

                ctx.strokeText(text, ctx.measureText(text).width + 5 + IMG_SIZE, y + (IMG_SIZE / 2) - 21)
                ctx.fillStyle = "#000000"
                ctx.shadowBlur = 0
                ctx.fillText(text, ctx.measureText(text).width + 5 + IMG_SIZE, y + (IMG_SIZE / 2) - 21)

                y += IMG_SIZE + 5
            }

            banner_unit_list.push(canvas)
        }

        this.unit_list_image = banner_unit_list

        return this
    }
}

let ALL_BANNER_LIST = []

function find_banner_containing_unit(u) {
    return ALL_BANNER_LIST.find((b) => b.all_units.includes(u))
}

function find_banner_containing_any_unit(units) {
    for (const unit in units) {
        let banner = find_banner_containing_unit(unit)
        if (banner !== null) return banner
    }
    return null
}

function banner_by_name(name) {
    return ALL_BANNER_LIST.find(b => b.names.includes(name))
}

function create_jp_banner() {
    const jp_units = UNIT_LIST.filter(u => u.jp)
    const ssrs = jp_units.filter(u => u.grade === Grade.SSR)

    if (banner_by_name("jp") !== undefined)
        ALL_BANNER_LIST = remove_items(ALL_BANNER_LIST, banner_by_name("jp"))

    if (ssrs.length < 1) return

    ALL_BANNER_LIST.push(
        new Banner(["kr", "jp"],
            "JP/KR exclusive draw",
            jp_units,
            [],
            4 / ssrs.length,
            0.5,
            ((100 - 4 - (6.6667 * R_UNIT_LIST.length)) / SR_UNIT_LIST.length),
            6.6667,
            "https://raw.githubusercontent.com/WhoIsAlphaHelix/evilmortybot/master/gc/banners/A9619A31-B793-4E12-8DF6-D0FCC706DEF2_1_105_c.jpeg",
            true,
            true,
            11, 150)
    )
}

async function load_banners() {
    await banner_by_name("general").reload(UNIT_LIST.filter(u => u.home_banners.includes("general") || (u.grade !== Grade.SSR && u.event === Event.BASE_GAME)))
    await banner_by_name("race 1").reload(UNIT_LIST.filter(u => u.home_banners.includes("race 1")))
    await banner_by_name("race 2").reload(UNIT_LIST.filter(u => u.home_banners.includes("race 2")))
    await banner_by_name("humans").reload(UNIT_LIST.filter(u => u.home_banners.includes("human")))
    await banner_by_name("gssr").reload(UNIT_LIST.filter(u => u.home_banners.includes("general") && u.grade === Grade.SSR && u.event === Event.BASE_GAME))

    ALL_BANNER_LIST = ALL_BANNER_LIST.sort((a, b) => a.order - b.order)
}

module.exports = {
    ALL_BANNER_LIST: ALL_BANNER_LIST,
    Banner: Banner,
    banner_by_name: banner_by_name,
    load_banners: load_banners,
    find_banner_containing_unit: find_banner_containing_unit,
    find_banner_containing_any_unit: find_banner_containing_any_unit
}