import { SlashCommandBuilder } from "@discordjs/builders";
import { ICommand } from "../../interfaces/i-command";

export default class TeamCommand extends ICommand {
	get data(): any {
		return new SlashCommandBuilder()
			.setName("team")
			.setDescription("Returns a random team")
			.addStringOption(option =>
				option
					.setName("race")
					.setDescription("Does the team have a specific race?")
					.addChoices([
						["Demon", "demon"],
						["Giant", "giant"],
						["Human", "human"],
						["Fairy", "fairy"],
						["God", "god"],
						["Unknown", "Unknown"],
					])
			)
			.addStringOption(option =>
				option
					.setName("type")
					.setDescription("Does the team have a specific type?")
					.addChoices([
						["Red", "red"],
						["Green", "green"],
						["Blue", "blue"],
						["Dark", "dark"],
						["Light", "light"],
					])
			)
			.addStringOption(option =>
				option
					.setName("grade")
					.setDescription("Does the team have a specific grade?")
					.addChoices([
						["SSR", "ssr"],
						["SR", "sr"],
						["R", "r"],
					])
			)
			.addStringOption(option =>
				option
					.setName("event")
					.setDescription("What event does the team come from?")
					.addChoices([
						["Grand Cross", "gc"],
						["Slime", "slime"],
						["Attack on Titan", "aot"],
						["King of Fighters", "kof"],
						["Valentines Day", "val"],
						["New Year", "ny"],
						["Halloween", "hw"],
						["Festival", "fes"],
						["Re: Zero", "re"],
						["Stranger Things", "st"],
						["Ragnarok", "ragna"],
					])
			)
			.addStringOption(option =>
				option
					.setName("affection")
					.setDescription("Does your team have any affection?")
					.addChoices([
						["Seven Deadly Sins", "sins"],
						["The 10 Commandments", "commandments"],
						["The 7 Catastrophes", "catastrophes"],
						["Holy Knights", "knight"],
						["Archangels", "angels"],
						["None", "none"],
					])
			)
			.addStringOption(option =>
				option
					.setName("banner")
					.setDescription("Is the unit in any banner?")
					.addChoices([
						["General", "general"],
						["Race I", "race one"],
						["Race II", "race two"],
						["Humans", "human"],
						["Ragnarok", "ragnarok"],
					])
			);
	}
}
