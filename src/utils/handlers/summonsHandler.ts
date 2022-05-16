import { MessageAttachment, CommandInteraction, GuildMember, Collection } from "discord.js";
import { multiDisplay, rotationDisplay, whaleDisplay } from "../../displays/bannerDisplay";
import Banner from "../../models/banner";
import { Unit, Grade } from "../../models/unit";
import { addToBox } from "../database_helper";
import { sendNavigationMenu, DefaultEmbed } from "../embeds";

export async function single(interaction: CommandInteraction, banner: Banner, amount: number = 1, person: GuildMember = interaction.member as GuildMember, ref: boolean = true) {
	const units: Unit[] = [];

	for (let i = 1; i <= amount; i++) units.push(banner.unitByChance());

	addToBox(person, units);

	await sendNavigationMenu(
		{
			navigatable: units,
			check: units.length > 1,
		},
		interaction,
		{
			content: person === interaction.member ? " " : `Single for ${person}`,
			files: [new MessageAttachment((await units[0].refreshIcon()).toBuffer(), "unit.png")],
			embeds: [new DefaultEmbed().setTitle(banner.prettyName + " (1x summon)").setImage("attachment://unit.png")],
		},
		ref,
		{
			idleTime: 30000,
			preCollect: async () => {
				if (units.length === 1) throw new Error();
			},
			update: async (i, _, c, p) => {
				if (c === undefined || c === null) return;

				await i.deferUpdate();
				await i.editReply({
					files: [new MessageAttachment((await c.refreshIcon()).toBuffer(), "unit.png")],
					embeds: [new DefaultEmbed().setTitle(`${banner.prettyName} (1x summon) [${p + 1}.]`).setImage("attachment://unit.png")],
				});
			},
		}
	);
}

export async function multi(
	interaction: CommandInteraction,
	banner: Banner,
	rotation: boolean = false,
	amount: number = 1,
	person: GuildMember = interaction.member as GuildMember,
	ref: boolean = true
) {
	if (rotation) {
		let units: Collection<Unit, number> = new Collection();
		const dbUnits = [];

		for (let i = 0; i < (banner.loyalty / 30) * 11; i++) {
			const unit = banner.unitByChance();

			if (units.has(unit)) units.set(unit, units.get(unit) + 1);
			else units.set(unit, 1);
		}

		if (ref) await interaction.deferReply();

		for (let [unit, amount] of units) {
			for (let i = 0; i < amount; i++) dbUnits.push(unit);
		}
		addToBox(person, dbUnits);

		if (units.size > 0) units = new Collection(Array.from(units).sort((a, b) => b[0].grade.toInt() - a[0].grade.toInt()));

		return await interaction.editReply({
			files: [new MessageAttachment(await rotationDisplay(units), "units.png")],
			content: person === interaction.member ? " " : `Rotation for ${person}`,
			embeds: [new DefaultEmbed().setTitle(`1 Rotation on ${banner.prettyName} (${banner.loyalty} Gems)`).setImage("attachment://units.png")],
		});
	}

	const units = [];

	for (let i = 1; i <= amount; i++) {
		const multi = [];
		for (let unit = 0; unit < banner.bannerType; unit++) multi.push(banner.unitByChance());
		units.push(multi);
	}

	addToBox(person, units.flat());

	await sendNavigationMenu(
		{
			navigatable: units,
			check: units.length > 1,
		},
		interaction,
		{
			content: person === interaction.member ? " " : `Multi for ${person}`,
			files: [new MessageAttachment(await multiDisplay(units[0], banner.bannerType === 5), "units.png")],
			embeds: [new DefaultEmbed().setTitle(`${banner.prettyName} (${banner.bannerType === 11 ? "11" : "5"}x summon)`).setImage("attachment://units.png")],
		},
		ref,
		{
			idleTime: 60000,
			preCollect: async () => {
				if (units.length === 1) throw new Error();
			},
			update: async (i, _, c, p) => {
				if (c === undefined || c === null || c.length === 0) return;

				await i.deferUpdate();
				await i.editReply({
					files: [new MessageAttachment(await multiDisplay(c, banner.bannerType === 5), "units.png")],
					embeds: [new DefaultEmbed().setTitle(`${banner.prettyName} (${banner.bannerType === 11 ? "11" : "5"}x summon) [${p + 1}.]`).setImage("attachment://units.png")],
				});
			},
		}
	);
}

export async function whale(interaction: CommandInteraction, banner: Banner, unit: Unit = undefined, person: GuildMember = interaction.member as GuildMember, ref: boolean = true) {
	let drawnUnits = [];
	const drawnSSRs = new Collection<Unit, number>();
	let counter = 0;

	function containsAnyUnit(drawn: Unit[]): [boolean, Unit] {
		for (let u of drawn) {
			if (unit === undefined) {
				if (u.grade === Grade.SSR) return [true, u];
			} else {
				if (unit == u) return [true, u];
			}
		}
		return [false, undefined];
	}

	let tempDrawn = [];

	if (ref) await interaction.deferReply();

	while (!containsAnyUnit(drawnUnits)[0]) {
		for (let unit = 0; unit < banner.bannerType; unit++) {
			let tempUnit = banner.unitByChance();
			tempDrawn.push(tempUnit);
			drawnUnits.push(tempUnit);
		}

		tempDrawn
			.filter(u => u.grade === Grade.SSR)
			.forEach(u => {
				if (drawnSSRs.has(u)) drawnSSRs.set(u, drawnSSRs.get(u) + 1);
				else drawnSSRs.set(u, 1);
			});
		tempDrawn.length = 0;
		counter++;
	}

	addToBox(person, drawnUnits);

	drawnUnits = drawnUnits.slice(-1 * banner.bannerType);

	await interaction.editReply({
		files: [new MessageAttachment(await whaleDisplay(drawnUnits, drawnSSRs, banner.bannerType === 5), "units.png")],
		embeds: [new DefaultEmbed().setTitle(`${banner.prettyName} (Whaled summons [${counter}x])`).setImage("attachment://units.png")],
		components: [],
		content: null,
	});
}

export async function infos(interaction: CommandInteraction, banner: Banner, ref: boolean = true) {
	await sendNavigationMenu(
		{
			navigatable: banner.unitListImage,
			check: true,
		},
		interaction,
		{
			files: [new MessageAttachment(banner.unitListImage[0].toBuffer(), "units.png")],
			embeds: [new DefaultEmbed().setTitle(`Units in ${banner.prettyName}  [Page: 1]`).setImage("attachment://units.png")],
		},
		ref,
		{
			idleTime: 15000,
			preCollect: async () => {},
			update: async (i, m, c, p) => {
				await m.removeAttachments();
				await i.update({
					embeds: [new DefaultEmbed().setTitle(`Units in ${banner.prettyName} [Page: ${p + 1}]`).setImage("attachment://units.png")],
					files: [new MessageAttachment(c.toBuffer(), "units.png")],
				});
			},
		}
	);
}
