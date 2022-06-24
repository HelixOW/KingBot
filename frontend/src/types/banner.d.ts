import { Unit } from "./unit";
import { Canvas } from "canvas";

export type Banner = {
	uniqueName: string;
	names: string[];
	pretttName: string;
	bannerType: number;
	background: string;
	shaftable: boolean;
	loyalty: number;
	order: number;

	includeAllSR: boolean;
	includeAllR: boolean;

	units: Unit[];
	rateUpUnits: Unit[];
	rUnits: Unit[];
	srUnits: Unit[];
	nonRateUpSSRUnits: Unit[];
	ssrUnits: Unit[];
	allUnits: Unit[];

	ssrUnitRate: number;
	ssrUnitRateUp: number;
	srUnitRate: number;
	rUnitRate: number;

	ssrChance: number;
	ssrRateUpChance: number;
	srChance: number;

	unitListImage: Canvas[];

	reload(): Promise<void>;
	hasUnit(): boolean;
	getUnitRate(): number;
	unitByChance(): Unit;
	loadUnitListImage(): Promise<Banner>;
};

export type DBBanner = {
	banner_name: string;
	pretty_name: string;
	ssr_rate: number;
	sr_rate: number;
	r_rate: number;
	ssr_rate_up: number;
	all_sr: boolean;
	all_r: boolean;
	banner_type: number;
	appear_order: number;
	loyalty: number;
	thumbnail: string;
};
