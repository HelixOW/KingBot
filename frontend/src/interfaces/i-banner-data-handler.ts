import Banner from "../models/banner";

export default interface IBannerDataHandler {
	readBanners(): Promise<boolean>;
	registerBanner(banner: Banner): Promise<boolean>;
	newestBannerId(): Promise<number>;

	refreshTask(): Promise<void>;
}
