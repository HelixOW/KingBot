import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export interface ICommand {
	get data(): SlashCommandBuilder;
	execute(interaction: CommandInteraction): void;
}

export namespace ICommand {
	type Constructor<T> = {
		new (...args: any[]): T;
		readonly prototype: T;
	};

	const implementations: Constructor<ICommand>[] = [];

	export function getImplementations(): Constructor<ICommand>[] {
		return [...implementations];
	}

	export function register<T extends Constructor<ICommand>>(ctor: T) {
		implementations.push(ctor);
		return ctor;
	}
}
