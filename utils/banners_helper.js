const {SR_UNIT_LIST, R_UNIT_LIST, Grade, UNIT_LIST, Event} = require("./units_helper")
const {remove_items} = require("./constants");
const {getRandomArbitrary, getRandomInt} = require("./general_helper");

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
        loyalty = 900
    ) {
        this.unique_name = name[0]
        this.names = name
        this.pretty_name = pretty_name
        this.banner_type = banner_type
        this.background = bg_url
        this.shaftable = this.names.filter(n => n.includes("gssr")).length === 0
        this.loyalty = loyalty

        this.include_all_sr = include_all_sr
        this.include_all_r = include_all_r

        if (sr_unit_rate !== 0 && include_all_sr) units.concat(SR_UNIT_LIST)
        if (r_unit_rate !== 0 && include_all_r) units.concat(R_UNIT_LIST)

        this.units = units
        this.rate_up_units = rate_up_units

        this.r_units = this.units.filter(u => u.grade === Grade.R)
        this.sr_units = this.units.filter(u => u.grade === Grade.SR)
        this.ssr_units = this.units.filter(u => u.grade === Grade.SSR && !this.rate_up_units.includes(u))
        this.all_ssr_units = this.units.filter(u => u.grade === Grade.SSR)
        this.all_units = this.rate_up_units + this.units

        console.log(this.ssr_units)

        this.ssr_unit_rate = ssr_unit_rate
        this.ssr_unit_rate_up = ssr_unit_rate_up
        this.sr_unit_rate = sr_unit_rate
        this.r_unit_rate = r_unit_rate

        this.ssr_chance = (this.ssr_unit_rate_up * this.rate_up_units.length) + (this.ssr_unit_rate * this.ssr_units.length)
        this.ssr_rate_up_chance = this.rate_up_units.length !== 0 ? (this.ssr_unit_rate_up * this.rate_up_units) : 0
        this.sr_chance = this.sr_unit_rate * this.sr_units.length
    }

    reload(new_units) {
        this.units = new_units

        this.r_units = this.units.filter(u => u.grade === Grade.R)
        this.sr_units = this.units.filter(u => u.grade === Grade.SR)
        this.ssr_units = this.units.filter(u => u.grade === Grade.SSR && !this.rate_up_units.includes(u))
        this.all_ssr_units = this.units.filter(u => u.grade === Grade.SSR)
        this.all_units = this.rate_up_units + this.units
    }

    has_unit(possible_units) {
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

        console.log(draw_chance)

        let u

        if (this.ssr_rate_up_chance >= draw_chance && this.rate_up_units.length !== 0) {
            console.log("a1" + getRandomInt(0, this.rate_up_units.length - 1))
            u = this.rate_up_units[getRandomInt(0, this.rate_up_units.length - 1)]
        }
        else if (this.ssr_chance >= draw_chance || this.sr_units.length === 0) {
            console.log("a2 " + getRandomInt(0, this.ssr_units.length - 1))
            u = this.ssr_units[getRandomInt(0, this.ssr_units.length - 1)]
        }
        else if (this.sr_chance >= draw_chance || this.r_units.length === 0) {
            console.log("a3 " + getRandomInt(0, this.sr_units.length - 1))
            u = this.sr_units[getRandomInt(0, this.sr_units.length - 1)]
        }
        else {
            console.log("a4 " + getRandomInt(0, this.r_units.length - 1))
            u = this.r_units[getRandomInt(0, this.r_units.length - 1)]
        }

        console.log(u)

        return u
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
        Banner(["kr", "jp"],
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

function load_banners() {
    banner_by_name("part 1").reload(UNIT_LIST.filter(u => u.home_banners.includes("part 1") || (u.grade !== Grade.SSR && u.event === Event.BASE_GAME)))
    banner_by_name("part 2").reload(UNIT_LIST.filter(u => u.home_banners.includes("part 2") || (u.grade !== Grade.SSR && u.event === Event.BASE_GAME)))
    banner_by_name("part 3").reload(UNIT_LIST.filter(u => u.home_banners.includes("part 3") || (u.grade !== Grade.SSR && u.event === Event.BASE_GAME)))
    banner_by_name("race 1").reload(UNIT_LIST.filter(u => u.home_banners.includes("race 1")))
    banner_by_name("race 2").reload(UNIT_LIST.filter(u => u.home_banners.includes("race 2")))
    banner_by_name("human").reload(UNIT_LIST.filter(u => u.home_banners.includes("human")))
}

module.exports = {
    ALL_BANNER_LIST: ALL_BANNER_LIST,
    Banner: Banner,
    banner_by_name: banner_by_name
}