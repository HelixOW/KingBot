import { srUnitList, rUnitList,  Grade, Event, unitList, Unit } from './units';
import { IMG_SIZE } from "./constants"
import { getRandom, chunk, getRandomArrayValue } from './general';
import { Canvas, createCanvas } from "canvas"
import { longestNamedUnit } from "./units"
import { Collection } from 'discord.js';

export class Banner {

    private _uniqueName: string;
    public get uniqueName(): string {
        return this._uniqueName;
    }
    public set uniqueName(value: string) {
        this._uniqueName = value;
    }

    private _names: string[];
    public get names(): string[] {
        return this._names;
    }
    public set names(value: string[]) {
        this._names = value;
    }

    private _prettyName: string;
    public get prettyName(): string {
        return this._prettyName;
    }
    public set prettyName(value: string) {
        this._prettyName = value;
    }

    private _bannerType: number;
    public get bannerType(): number {
        return this._bannerType;
    }
    public set bannerType(value: number) {
        this._bannerType = value;
    }

    private _background: string;
    public get background(): string {
        return this._background;
    }
    public set background(value: string) {
        this._background = value;
    }

    private _shaftable: boolean;
    public get shaftable(): boolean {
        return this._shaftable;
    }
    public set shaftable(value: boolean) {
        this._shaftable = value;
    }

    private _loyalty: number;
    public get loyalty(): number {
        return this._loyalty;
    }
    public set loyalty(value: number) {
        this._loyalty = value;
    }

    private _order: number;
    public get order(): number {
        return this._order;
    }
    public set order(value: number) {
        this._order = value;
    }

    private _includeAllSR: boolean;
    public get includeAllSR(): boolean {
        return this._includeAllSR;
    }
    public set includeAllSR(value: boolean) {
        this._includeAllSR = value;
    }

    private _includeALLR: boolean;
    public get includeALLR(): boolean {
        return this._includeALLR;
    }
    public set includeALLR(value: boolean) {
        this._includeALLR = value;
    }

    private _units: Unit[]; 
    public get units(): Unit[] {
        return this._units;
    }
    public set units(value: Unit[]) {
        this._units = value;
    }

    private _rateUpUnits: Unit[];
    public get rateUpUnits(): Unit[] {
        return this._rateUpUnits;
    }
    public set rateUpUnits(value: Unit[]) {
        this._rateUpUnits = value;
    }

    private _rUnits: Unit[];
    public get rUnits(): Unit[] {
        return this._rUnits;
    }
    public set rUnits(value: Unit[]) {
        this._rUnits = value;
    }

    private _srUnits: Unit[];
    public get srUnits(): Unit[] {
        return this._srUnits;
    }
    public set srUnits(value: Unit[]) {
        this._srUnits = value;
    }

    private _nonRateUpSSRUnits: Unit[];
    public get nonRateUpSSRUnits(): Unit[] {
        return this._nonRateUpSSRUnits;
    }
    public set nonRateUpSSRUnits(value: Unit[]) {
        this._nonRateUpSSRUnits = value;
    }

    private _ssrUnits: Unit[];
    public get ssrUnits(): Unit[] {
        return this._ssrUnits;
    }
    public set ssrUnits(value: Unit[]) {
        this._ssrUnits = value;
    }

    private _allUnits: Unit[];
    public get allUnits(): Unit[] {
        return this._allUnits;
    }
    public set allUnits(value: Unit[]) {
        this._allUnits = value;
    }

    private _ssrUnitRate: number;
    public get ssrUnitRate(): number {
        return this._ssrUnitRate;
    }
    public set ssrUnitRate(value: number) {
        this._ssrUnitRate = value;
    }

    private _ssrUnitRateUp: number;
    public get ssrUnitRateUp(): number {
        return this._ssrUnitRateUp;
    }
    public set ssrUnitRateUp(value: number) {
        this._ssrUnitRateUp = value;
    }

    private _srUnitRate: number;
    public get srUnitRate(): number {
        return this._srUnitRate;
    }
    public set srUnitRate(value: number) {
        this._srUnitRate = value;
    }

    private _rUnitRate: number;
    public get rUnitRate(): number {
        return this._rUnitRate;
    }
    public set rUnitRate(value: number) {
        this._rUnitRate = value;
    }

    private _ssrChance: number;
    public get ssrChance(): number {
        return this._ssrChance;
    }
    public set ssrChance(value: number) {
        this._ssrChance = value;
    }

    private _ssrRateUpChance: number;
    public get ssrRateUpChance(): number {
        return this._ssrRateUpChance;
    }
    public set ssrRateUpChance(value: number) {
        this._ssrRateUpChance = value;
    }

    private _srChance: number;
    public get srChance(): number {
        return this._srChance;
    }
    public set srChance(value: number) {
        this._srChance = value;
    }
    
    private _unitListImage: Canvas[];
    public get unitListImage(): Canvas[] {
        return this._unitListImage;
    }
    public set unitListImage(value: Canvas[]) {
        this._unitListImage = value;
    }

    constructor(
        name: string[],
        pretty_name: string,
        units: Unit[],
        rate_up_units: Unit[] = [],
        ssr_unit_rate: number,
        ssr_unit_rate_up: number = 0.5,
        sr_unit_rate: number,
        r_unit_rate: number,
        bg_url: string,
        include_all_sr: boolean = true,
        include_all_r: boolean = true,
        banner_type: number = 11,
        loyalty: number = 900,
        order: number
    ) {
        this.uniqueName = name[0]
        this.names = name
        this.prettyName = pretty_name
        this.bannerType = banner_type
        this.background = bg_url
        this.shaftable = this.names.filter(n => n.includes("gssr")).length === 0
        this.loyalty = loyalty
        this.order = order

        this.includeAllSR = include_all_sr
        this.includeALLR = include_all_r

        this.units = units

        if (sr_unit_rate !== 0 && include_all_sr)
            this.units.push(...srUnitList.values())
        if (r_unit_rate !== 0 && include_all_r) 
            this.units.push(...rUnitList.values())

        this.rateUpUnits = rate_up_units

        this.rUnits = this.units.filter(u => u.grade === Grade.R)
        this.srUnits = this.units.filter(u => u.grade === Grade.SR)

        this.nonRateUpSSRUnits = this.units.filter(u => u.grade === Grade.SSR && !this.rateUpUnits.includes(u))
        this.ssrUnits = this.units.filter(u => u.grade === Grade.SSR)
        this.allUnits = this.rateUpUnits.concat(this.units)

        this.ssrUnitRate = ssr_unit_rate
        this.ssrUnitRateUp = ssr_unit_rate_up
        this.srUnitRate = sr_unit_rate
        this.rUnitRate = r_unit_rate

        this.ssrChance = (this.ssrUnitRateUp * this.rateUpUnits.length) + (this.ssrUnitRate * this.nonRateUpSSRUnits.length)
        this.ssrRateUpChance = this.rateUpUnits.length !== 0 ? (this.ssrUnitRateUp * this.rateUpUnits.length) : 0
        this.srChance = this.srUnitRate * this.srUnits.length

        this.unitListImage = []
    }

    public async reload(newUnits: Collection<number, Unit>) {
        this.units = [...newUnits.values()]

        this.rUnits = this.units.filter(u => u.grade === Grade.R)
        this.srUnits = this.units.filter(u => u.grade === Grade.SR)

        this.nonRateUpSSRUnits = this.units.filter(u => u.grade === Grade.SSR && !this.rateUpUnits.includes(u))
        this.ssrUnits = this.units.filter(u => u.grade === Grade.SSR)
        this.allUnits = this.rateUpUnits.concat(this.units)

        this.ssrChance = (this.ssrUnitRateUp * this.rateUpUnits.length) + (this.ssrUnitRate * this.nonRateUpSSRUnits.length)
        this.srChance = this.srUnitRate * this.srUnits.length

        await this.loadUnitListImage()
    }

    public hasUnit(possibleUnits: Unit[]): boolean {
        return this.allUnits.map(u => u.id).some(r => possibleUnits.map(u => u.id).includes(r))
    }

    public getUnitRate(unit: Unit): number {
        if (this.rateUpUnits.includes(unit))
            return this.ssrUnitRateUp
        else if (this.nonRateUpSSRUnits.includes(unit))
            return this.ssrUnitRate
        else if (this.srUnits.includes(unit))
            return this.srUnitRate
        else if (this.rUnits.includes(unit))
            return this.rUnitRate
    }

    public unitByChance(): Unit {
        const draw_chance = new Number(getRandom(0, 100).toFixed(4))

        let u: Unit

        if (this.ssrRateUpChance >= draw_chance && this.rateUpUnits.length !== 0) {
            u = getRandomArrayValue(this.rateUpUnits)
        }
        else if (this.ssrChance >= draw_chance || this.srUnits.length === 0) {
            u = getRandomArrayValue(this.nonRateUpSSRUnits)
        }
        else if (this.srChance >= draw_chance || this.rUnits.length === 0) {
            u = getRandomArrayValue(this.srUnits)
        }
        else {
            u = getRandomArrayValue(this.rUnits)
        }

        return u
    }

    public async loadUnitListImage() {
        if(this.ssrUnits.length === 0) {
            this.unitListImage = [createCanvas(IMG_SIZE, IMG_SIZE)]
            return this
        }

        const chunked_units = chunk(this.allUnits, 5)
        const banner_unit_list = []

        for(const units of chunked_units) {
            let canvas = createCanvas(0, 0)
            let ctx = canvas.getContext("2d")

            canvas.width = IMG_SIZE + ctx.measureText(longestNamedUnit(new Collection(units.map(u => [u.id, u]))).name + " - 99.9999%").width + 5
            canvas.height = (IMG_SIZE * units.length) + (9 * (units.length - 1))

            ctx = canvas.getContext("2d")

            let y = 0
            for(const unit of units) {
                ctx.drawImage(await unit.refreshIcon(), 0, y)

                ctx.font = "42px arial"
                ctx.textAlign = "center"
                ctx.fillStyle = "#000000"
                ctx.shadowBlur = 10
                ctx.shadowColor = "#000000"

                let text = unit.name + " - " + this.getUnitRate(unit)

                ctx.strokeText(text, ctx.measureText(text).width + 5 + IMG_SIZE, y + (IMG_SIZE / 2) - 21)
                ctx.fillStyle = "#000000"
                ctx.shadowBlur = 0
                ctx.fillText(text, ctx.measureText(text).width + 5 + IMG_SIZE, y + (IMG_SIZE / 2) - 21)

                y += IMG_SIZE + 5
            }

            banner_unit_list.push(canvas)
        }

        this.unitListImage = banner_unit_list

        return this
    }
}

export let allBannerList: Collection<string, Banner> = new Collection()

export function findBannerContaining(u: Unit): Banner {
    return allBannerList.find((b) => b.allUnits.includes(u))
}

export function findBannerContainingAny(units: Unit[]): Banner {
    for (const unit of units) {
        let banner = findBannerContaining(unit)
        if (banner !== null) return banner
    }
    return null
}

export function bannerByName(name: string) {
    return allBannerList.find(b => b.names.includes(name))
}

export async function loadBanners() {
    await bannerByName("general").reload(unitList.filter(u => u.homeBanners.includes("general") || (u.grade !== Grade.SSR && u.event === Event.BASE_GAME)))
    await bannerByName("race 1").reload(unitList.filter(u => u.homeBanners.includes("race 1")))
    await bannerByName("race 2").reload(unitList.filter(u => u.homeBanners.includes("race 2")))
    await bannerByName("humans").reload(unitList.filter(u => u.homeBanners.includes("human")))
    await bannerByName("gssr").reload(unitList.filter(u => u.homeBanners.includes("general") && u.grade === Grade.SSR && u.event === Event.BASE_GAME))

    allBannerList = allBannerList.sort((a, b) => a.order - b.order)
}