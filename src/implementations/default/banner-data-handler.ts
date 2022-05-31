import IBannerDataHandler from "../../interfaces/i-banner-data-handler";
import banner from "../../models/banner";
import { databaseHandler } from "../../utilities/database-handler";
import { unitById } from "../../utils/units";
import { bannerCache } from "../../utilities/cache";
import Banner from "../../models/banner";

export default class BannerDataHandler implements IBannerDataHandler {
	async refreshTask(): Promise<void> {
		setInterval(async () => {
			await this.readBanners();
		}, 1000 * 60 * 10);
	}

	async readBanners(): Promise<boolean> {
		/* for (const banner of databaseHandler.database.prepare("SELECT * FROM banners ORDER BY 'order'").all()) {
			const bannerNames = databaseHandler.database
				.prepare("SELECT alternative_name FROM banner_names WHERE name=?")
				.all(banner.name)
				.map(data => data.alternative_name);

			const bannerUnits = await Promise.all(
				databaseHandler.database
					.prepare("SELECT unit_id FROM banners_units WHERE banner_name=?")
					.all(banner.name)
					.map(async data => await unitById(data.unit_id))
			);

			const bannerRatedUpUnits = await Promise.all(
				databaseHandler.database
					.prepare("SELECT unit_id FROM banners_rate_up_units WHERE banner_name=?")
					.all(banner.name)
					.map(async data => await unitById(data.unit_id))
			);

			bannerNames.push(banner.name);

			bannerCache.set(
				banner.name,
				JSON.stringify(
					await new Banner(
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
					).loadUnitListImage()
				)
			);
		} */

		return true;
	}

	async registerBanner(banner: banner): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	async newestBannerId(): Promise<number> {
		throw new Error("Method not implemented.");
	}
}
