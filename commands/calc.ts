import { SlashCommandBuilder } from "@discordjs/builders";
import { DefaultEmbed } from "../utils/embeds";
import { CommandInteraction } from 'discord.js';

function rawCalcDmg(modifier: number, atk: number, critDamage: number, critChance: number,
	 defense: number, critDefense: number, critRes: number, typeAdvantage: number, variance: boolean) {
	let crit_mod = critChance - critRes > Math.random() ? critDamage - critDefense : 1;
	typeAdvantage = typeAdvantage > 0 ? 1.3 : typeAdvantage < 0 ? 0.8 : 1;
	let variance_mod = variance ? 0.85 + (1.05 - 0.85) : 1;

	return variance_mod * (modifier * atk * (crit_mod - defense)) * typeAdvantage;
}

function calcDamage(modifier: number, atk: number, atkBuff: number, atkRelBuff: number[], critDamage: number,
	 def: number, defRelDebuff: number[], critDef: number, typeAdvantage: number, spike: boolean, aplifyStacks: number,
	 freeze: number, damageDealtBuff: number, crits: boolean) {
	let buffed_atk = atk * atkBuff;
	let additional_damage = 1 + 0.3 * aplifyStacks;

	if (freeze) {
		defRelDebuff = [];
		if (freeze >= 2) additional_damage += freeze - 1 + (freeze - 3) * 0.2;
	}
	if (damageDealtBuff) additional_damage += damageDealtBuff;

	for (let buffs of atkRelBuff) {
		buffed_atk *= 1 + buffs[0];
		critDamage += buffs[2];
	}

	for (let d of defRelDebuff) critDef = Math.max(critDef + d, 0);

	if (spike) critDamage *= 2;

	return rawCalcDmg(modifier * additional_damage, buffed_atk, critDamage, crits ? 999 : 0, def, critDef, 0, typeAdvantage, false);
}

function calcKelak(
	boss: string,
	atk: number,
	critDamage: number,
	difficulty: string,
	ult: number,
	ggowther: number,
	stacks: number,
	deriBuff: number,
	deriEvade: boolean,
	sariel: boolean,
	ellatteStacks: number,
	ellatteDebuff: number,
	ellatteUlt: boolean,
	helbramBuff: number,
	freeze: number,
	marBuff: number,
	isCrit: boolean
) {
	critDamage = critDamage / 100;
	let defense = 0;
	let critDefense = {
		"kelak": { "extreme": 0.75, "hard": 0.47, normal: 0.35 },
		"einek": { extreme: 0, hard: 0, normal: 0 },
		"akumu": { extreme: 0.5, hard: 0.47, normal: 0 },
	}[boss][difficulty];

	let atkBuff = 1;
	let atkRelBuff = [];
	let defRelDebuff = [];

	let advantage = 0;
	let spike = false;
	let amplifyStacks = 0;

	let ultModifier = 6.3 + (ult - 1) * 0.63;

	amplifyStacks += stacks;
	atkBuff *= 1 + 0.1 * stacks;
	amplifyStacks += 3;

	switch (deriBuff) {
		case 1:
			atkBuff *= 1.2;
			break;
		case 2:
			atkBuff *= 1.3;
			break;
		case 3:
			atkBuff *= 1.5;
			break;
		default:
			break;
	}
	if (deriEvade) amplifyStacks++;

	switch (marBuff) {
		case 1:
			marBuff = 0.3;
			amplifyStacks += 2
			break;
		case 2:
			marBuff = 0.45;
			amplifyStacks += 2
			break;
		case 3:
			marBuff = 0.5;
			amplifyStacks += 2
			break;
		default:
			break;
	}

	if (ellatteStacks !== 0) atkRelBuff.push([0, 0, 0.05 * ellatteStacks]);

	if (ellatteDebuff !== 0) defRelDebuff.push(-0.2 - ellatteDebuff * 0.1);

	if (ellatteUlt) amplifyStacks += 2;

	if (helbramBuff > 0) {
		let buff = helbramBuff === 1 ? 0.15 : helbramBuff === 2 ? 0.2 : 0.3;
		amplifyStacks += 1;
		atkRelBuff.push([buff, buff, buff]);
	}

	if (ggowther !== 0) atkRelBuff.push([0.07 * ggowther, 0.07 * ggowther, 0.07 * ggowther]);

	if (sariel) defRelDebuff.push(-0.5);

	return calcDamage(ultModifier, atk, atkBuff, atkRelBuff, critDamage, defense, defRelDebuff, critDefense, advantage, spike, amplifyStacks, freeze, marBuff, isCrit);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("calc")
		.setDescription("Calculate a estimate Guildboss Score.")
		.addIntegerOption(option => option.setName("attack").setDescription("How much attack does your Derieri have?").setRequired(true))
		.addStringOption(option =>
			option.setName("boss").setDescription("Which boss do you want to calculate?").addChoices([["Kelak", "kelak"], ["Einek", "einek"], ["Akumu", "akumu"]])
		)
		.addIntegerOption(option => option.setName("crit_damage").setDescription("How much crit damage (in %) does your Derieri have? Default: 100%"))
		.addStringOption(option => option.setName("difficulty").setDescription("Which difficulty are you trying?").addChoices([["Extreme", "ex"], ["Hard", "hard"], ["Normal", "normal"]]))
		.addIntegerOption(option => option.setName("ult").setDescription("What's your Derieri ult level?").addChoices([["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6]]))
		.addIntegerOption(option => option.setName("ggowther_stacks").setDescription("How many green Gowther stacks do you have? Default: 5"))
		.addIntegerOption(option => option.setName("deri_stacks").setDescription("How many Derieri Stacks do you have? Default: 10"))
		.addIntegerOption(option => option.setName("deri_buff").setDescription("What buff level did Derieri use? Default: 3").addChoices([["None", 0], ["1", 1], ["2", 2], ["3", 3]]))
		.addBooleanOption(option => option.setName("deri_evade").setDescription("Does Derieri have a evade effect applied? Default: yes"))
		.addBooleanOption(option => option.setName("sariel").setDescription("Do you use Sariel as a link? Default: yes"))
		.addIntegerOption(option => option.setName("ellatte_stacks").setDescription("How many Ellatte Stacks do you have? Default: 0"))
		.addIntegerOption(option => option.setName("ellatte_debuff").setDescription("What debuff level did Ellatte use? Default: none").addChoices([["None", 0], ["1", 1], ["2", 2], ["3", 3]]))
		.addBooleanOption(option => option.setName("ellatte_ult").setDescription("Is Ellatte Ult active? Default: false"))
		.addIntegerOption(option => option.setName("helbram_buff").setDescription("What buff level did Helbram use? Default: 3").addChoices([["None", 0], ["1", 1], ["2", 2], ["3", 3]]))
		.addIntegerOption(option => option.setName("freeze").setDescription("What freeze level is used? Default: none").addChoices([["None", 0], ["1", 1], ["2", 2], ["3", 3]]))
		.addIntegerOption(option => option.setName("margaret").setDescription("What margaret buff level is used? Default: none").addChoices([["None", 0], ["1", 1], ["2", 2], ["3", 3]]))
		.addBooleanOption(option => option.setName("crits").setDescription("Did it crit or not? Default: yes")),

	async execute(interaction: CommandInteraction) {
		const boss = interaction.options.getString("boss") === null ? "kelak" : interaction.options.getString("boss");

		const attack: number = interaction.options.getInteger("attack");
		const critDamage: number = interaction.options.getInteger("crit_damage") === null ? 100 : interaction.options.getInteger("crit_damage");
		const difficulty: string = interaction.options.getString("difficulty") === null ? "extreme" : interaction.options.getString("difficulty");
		const ult: number = interaction.options.getInteger("ult") === null ? 6 : interaction.options.getInteger("ult");
		const ggowtherStacks: number = interaction.options.getInteger("ggowther_stacks") === null ? 5 : interaction.options.getInteger("ggowther_stacks");
		const deriStacks: number = interaction.options.getInteger("deri_stacks") === null ? 10 : interaction.options.getInteger("deri_stacks");
		const deriBuff: number = interaction.options.getInteger("deri_buff") === null ? 3 : interaction.options.getInteger("deri_buff");
		const deriEvade: boolean = interaction.options.getBoolean("deri_evade") === null ? true : interaction.options.getBoolean("deri_evade");
		const sariel: boolean = interaction.options.getBoolean("sariel") === null ? true : interaction.options.getBoolean("sariel");
		const ellatteStacks: number = interaction.options.getInteger("ellatte_stacks") === null ? 0 : interaction.options.getInteger("ellatte_stacks");
		const ellateDebuff: number = interaction.options.getInteger("ellatte_debuff") === null ? 0 : interaction.options.getInteger("ellatte_debuff");
		const ellatteUlt: boolean = interaction.options.getBoolean("ellatte_ult") === null ? false : interaction.options.getBoolean("ellatte_ult");
		const helbramBuff: number = interaction.options.getInteger("helbram_buff") === null ? 3 : interaction.options.getInteger("helbram_buff");
		const freeze: number = interaction.options.getInteger("freeze") === null ? 0 : interaction.options.getInteger("freeze");
		const margaret: number = interaction.options.getInteger("margaret") === null ? 0 : interaction.options.getInteger("margaret");
		const crits: boolean = interaction.options.getBoolean("crits") === null ? true : interaction.options.getBoolean("crits");

		const points = calcKelak(
			boss,
			attack,
			critDamage,
			difficulty,
			ult,
			ggowtherStacks,
			deriStacks,
			deriBuff,
			deriEvade,
			sariel,
			ellatteStacks,
			ellateDebuff,
			ellatteUlt,
			helbramBuff,
			freeze,
			margaret,
			crits
		);

		await interaction.reply({
			embeds: [
				new DefaultEmbed()
					.setTitle(`Points for ${boss.charAt(0).toUpperCase() + boss.slice(1)}`)
					.addField(":dagger: Attack", `${attack.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`, true)
					.addField(":dart: Crit damage", `${critDamage}%`, true)
					.addField(":beginner: Difficulty", `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`, true)
					.addField("<:deri_ult:872129958808535111> Ult level", `${ult}`, true)
					.addBlankField()
					.addField("<:deri_passive:872130404545609788> Deri passive stacks", `${deriStacks}`, true)
					.addField("<:134:844176979674267658> Gowther stacks", `${ggowtherStacks}`, true)
					.addField("<:ellatte_passive:872135166565425212> Ellatte stacks", `${ellatteStacks}`, true)
					.addField("<:deri_buff:872130729297993769> Deri buff level", `${deriBuff}`, true)
					.addField("<:151:844176979356155934> Sariel link", `${sariel}`, true)
					.addField("<:ellatte_debuff:872134086666358825> Ellatte debuff", `${ellateDebuff}`, true)
					.addField(":ninja: Derieri evade", `${deriEvade}`, true)
					.addField(":fairy: Helbram buff", `${helbramBuff}`, true)
					.addField("<:ellatte_ult:872134085714251846> Ellatte ult", `${ellatteUlt}`, true)
					.addField(":ice_cube: Freeze", `${freeze}`, true)
					.addField(":sheep: Margaret buff", `${margaret}`, true)
					.addField(":zap: Crit?", `${crits}`, true)
					.addBlankField()
					.addField(
						":trophy: Hits for",
						`${points
							.toFixed(0)
							.toString()
							.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
					),
			],
		});
	},
};
