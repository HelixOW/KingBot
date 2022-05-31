import { longestNamedUnit } from "../utils/units";
import { IMG_SIZE } from "../utilities/constants";
import { getRandom, chunk, getRandomArrayValue } from "../utils/general";
import { Canvas, createCanvas } from "canvas";
import { Collection } from "discord.js";
import { Unit, Grade, Event } from "./unit";
import { unitCache } from "../utilities/cache";

export default class Banner {
	public readonly uniqueName: string;
	public readonly names: string[];
	public readonly prettyName: string;
	public readonly bannerType: number;
	public readonly background: string;
	public readonly shaftable: boolean;
	public readonly loyalty: number;
	public readonly order: number;
	public readonly includeAllSR: boolean;
	public readonly includeALLR: boolean;
	public units: Unit[];
	public rateUpUnits: Unit[];
	public rUnits: Unit[];
	public srUnits: Unit[];
	public nonRateUpSSRUnits: Unit[];
	public ssrUnits: Unit[];
	public allUnits: Unit[];
	public readonly ssrUnitRate: number;
	public readonly ssrUnitRateUp: number;
	public readonly srUnitRate: number;
	public readonly rUnitRate: number;
	public ssrChance: number;
	public ssrRateUpChance: number;
	public srChance: number;
	public unitListImage: Canvas[];

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
		this.uniqueName = name[0];
		this.names = name;
		this.prettyName = pretty_name;
		this.bannerType = banner_type;
		this.background = bg_url;
		this.shaftable = this.names.filter(n => n.includes("gssr")).length === 0;
		this.loyalty = loyalty;
		this.order = order;

		this.includeAllSR = include_all_sr;
		this.includeALLR = include_all_r;

		this.units = units;

		this.rateUpUnits = rate_up_units;

		this.rUnits = this.units.filter(u => u.grade === Grade.R);
		this.srUnits = this.units.filter(u => u.grade === Grade.SR);

		this.nonRateUpSSRUnits = this.units.filter(u => u.grade === Grade.SSR && !this.rateUpUnits.includes(u));
		this.ssrUnits = this.units.filter(u => u.grade === Grade.SSR);
		this.allUnits = this.rateUpUnits.concat(this.units);

		this.ssrUnitRate = ssr_unit_rate;
		this.ssrUnitRateUp = ssr_unit_rate_up;
		this.srUnitRate = sr_unit_rate;
		this.rUnitRate = r_unit_rate;

		this.ssrChance = this.ssrUnitRateUp * this.rateUpUnits.length + this.ssrUnitRate * this.nonRateUpSSRUnits.length;
		this.ssrRateUpChance = this.rateUpUnits.length !== 0 ? this.ssrUnitRateUp * this.rateUpUnits.length : 0;
		this.srChance = this.srUnitRate * this.srUnits.length;

		this.unitListImage = [];
	}

	public async reload(newUnits: Collection<number, Unit>) {
		this.units = [...newUnits.values()];

		if (this.srUnitRate !== 0 && this.includeAllSR) this.units.push(...(await unitCache.getAll()).filter(u => u.grade === Grade.SR && u.event === Event.BASE_GAME));
		if (this.rUnitRate !== 0 && this.includeALLR) this.units.push(...(await unitCache.getAll()).filter(u => u.grade === Grade.R && u.event === Event.BASE_GAME));

		this.rUnits = this.units.filter(u => u.grade === Grade.R);
		this.srUnits = this.units.filter(u => u.grade === Grade.SR);

		this.nonRateUpSSRUnits = this.units.filter(u => u.grade === Grade.SSR && !this.rateUpUnits.includes(u));
		this.ssrUnits = this.units.filter(u => u.grade === Grade.SSR);
		this.allUnits = this.rateUpUnits.concat(this.units);

		this.ssrChance = this.ssrUnitRateUp * this.rateUpUnits.length + this.ssrUnitRate * this.nonRateUpSSRUnits.length;
		this.srChance = this.srUnitRate * this.srUnits.length;

		await this.loadUnitListImage();
	}

	public hasUnit(possibleUnits: Unit[]): boolean {
		return this.allUnits.map(u => u.id).some(r => possibleUnits.map(u => u.id).includes(r));
	}

	public getUnitRate(unit: Unit): number {
		if (this.rateUpUnits.includes(unit)) return this.ssrUnitRateUp;
		else if (this.nonRateUpSSRUnits.includes(unit)) return this.ssrUnitRate;
		else if (this.srUnits.includes(unit)) return this.srUnitRate;
		else if (this.rUnits.includes(unit)) return this.rUnitRate;
	}

	public unitByChance(): Unit {
		const draw_chance = new Number(getRandom(0, 100).toFixed(4));

		let u: Unit;

		if (this.ssrRateUpChance >= draw_chance && this.rateUpUnits.length !== 0) {
			u = getRandomArrayValue(this.rateUpUnits);
		} else if (this.ssrChance >= draw_chance || this.srUnits.length === 0) {
			u = getRandomArrayValue(this.nonRateUpSSRUnits);
		} else if (this.srChance >= draw_chance || this.rUnits.length === 0) {
			u = getRandomArrayValue(this.srUnits);
		} else {
			u = getRandomArrayValue(this.rUnits);
		}

		return u;
	}

	public async loadUnitListImage() {
		if (this.ssrUnits.length === 0) {
			this.unitListImage = [createCanvas(IMG_SIZE, IMG_SIZE)];
			return this;
		}

		const chunked_units = chunk(this.allUnits, 5);
		const banner_unit_list = [];

		for (const units of chunked_units) {
			let canvas = createCanvas(0, 0);
			let ctx = canvas.getContext("2d");

			canvas.width = IMG_SIZE + ctx.measureText(longestNamedUnit(units).name + " - 99.9999%").width + 5;
			canvas.height = IMG_SIZE * units.length + 9 * (units.length - 1);

			ctx = canvas.getContext("2d");

			let y = 0;
			for (const unit of units) {
				ctx.drawImage(await unit.refreshIcon(), 0, y);

				ctx.font = "42px arial";
				ctx.textAlign = "center";
				ctx.fillStyle = "#000000";
				ctx.shadowBlur = 10;
				ctx.shadowColor = "#000000";

				let text = unit.name + " - " + this.getUnitRate(unit);

				ctx.strokeText(text, ctx.measureText(text).width + 5 + IMG_SIZE, y + IMG_SIZE / 2 - 21);
				ctx.fillStyle = "#000000";
				ctx.shadowBlur = 0;
				ctx.fillText(text, ctx.measureText(text).width + 5 + IMG_SIZE, y + IMG_SIZE / 2 - 21);

				y += IMG_SIZE + 5;
			}

			banner_unit_list.push(canvas);
		}

		this.unitListImage = banner_unit_list;

		return this;
	}
}
