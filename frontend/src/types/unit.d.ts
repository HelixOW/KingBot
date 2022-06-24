import { Canvas } from "canvas";
import { MessageEmbed } from "discord.js";

export type Type = {
	name: string;
};

export type Grade = {
	name: string;
};

export type Race = {
	name: string;
};

export type Event = {
	name: string;
};

export type Affection = {
	name: string;
};

export type Unit = {
	id: number;

	name: string;
	simpleName: string;
	variationName: string;
	altNames: string[];

	type: Type;
	grade: Grade;
	race: Race;
	event: Event;
	affection: Affection;

	iconURL: string;
	emoji: string;
	homeBanners: string[];
	icon: Canvas;

	infoEmbed(): MessageEmbed;
	loadIcon(): Promise<Unit>;
	refreshIcon(): Promise<Canvas>;
};

export type DBUnit = {
	unit_id: number;
	unit_name: string;
	simple_name: string;
	variational_name: string;
	unit_type: string;
	grade: string;
	race: string;
	unit_event: string;
	affection: string;
	banner: string;
	emoji: string;
	icon_url: string;
};
