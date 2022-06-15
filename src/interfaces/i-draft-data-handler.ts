import { Guild, GuildMember } from "discord.js";
import { Unit } from "../models/unit";

export default interface IDraftDataHandler {
	signupPlayer(who: GuildMember): Promise<void>;
	quitPlayer(who: GuildMember): Promise<void>;
	isPlayerSigned(who: GuildMember): Promise<boolean>;

	pickUnit(player: GuildMember, pick: Unit): Promise<void>;
	tradeUnit(p1: GuildMember, p2: GuildMember, offer: Unit, request: Unit): Promise<void>;
	changeUnit(player: GuildMember, offer: Unit, wanted: Unit): Promise<void>;
	hasUnit(player: GuildMember, check: Unit): Promise<boolean>;
	getPlayers(guild: Guild): Promise<GuildMember[]>;

	getCurrentSeasonName(): Promise<string>;
	getCurrentSeasonId(): Promise<number>;

	refreshTask(): Promise<void>;
}
