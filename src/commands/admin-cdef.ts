import { SlashCommandBuilder } from "@discordjs/builders";
import { ICommand } from "../interfaces/i-command";

export default class AdminCommand extends ICommand {
	get data(): any {
		return new SlashCommandBuilder().setName("admin").setDescription("Well well well").setDefaultPermission(false);
	}
}
