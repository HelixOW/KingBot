import { SlashCommandBuilder } from "@discordjs/builders";
import { ICommand } from "../../interfaces/i-command";

export default class SummonCommand extends ICommand {
	get data(): any {
		return new SlashCommandBuilder().setName("summon").setDescription("Show a summon menu");
	}
}
