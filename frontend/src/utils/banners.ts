import { Collection } from "discord.js";
import Banner from "../models/banner";
import { unitList } from "./units";
import { Unit, Grade, Event } from "../models/unit";

export let allBannerList: Collection<string, Banner> = new Collection();

export function findBannerContaining(u: Unit): Banner {
	return allBannerList.find(b => b.allUnits.includes(u));
}

export function findBannerContainingAny(units: Unit[]): Banner {
	for (const unit of units) {
		let banner = findBannerContaining(unit);
		if (banner !== null) return banner;
	}
	return null;
}

export function bannerByName(name: string) {
	return allBannerList.find(b => b.names.includes(name));
}

export async function loadBanners() {
	await bannerByName("general").reload(unitList.filter(u => u.homeBanners.includes("general") || (u.grade !== Grade.SSR && u.event === Event.BASE_GAME)));
	await bannerByName("race 1").reload(unitList.filter(u => u.homeBanners.includes("race 1")));
	await bannerByName("race 2").reload(unitList.filter(u => u.homeBanners.includes("race 2")));
	await bannerByName("humans").reload(unitList.filter(u => u.homeBanners.includes("human")));
	await bannerByName("gssr").reload(unitList.filter(u => u.homeBanners.includes("general") && u.grade === Grade.SSR && u.event === Event.BASE_GAME));

	//TODO: sortBanners(allBannerList);
}

export function sortBanners(bannerList: Banner[]): void {
	bannerList.sort((a, b) => a.order - b.order);
}
