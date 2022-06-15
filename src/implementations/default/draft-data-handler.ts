import { GuildMember, Guild } from "discord.js";
import IDraftDataHandler from "../../interfaces/i-draft-data-handler";
import { Unit } from "../../models/unit";
import { databaseHandler as db } from "../../utilities/database-handler";

export class DraftDataHandler implements IDraftDataHandler {
	async signupPlayer(who: GuildMember): Promise<void> {
		if (await this.isPlayerSigned(who)) return;

		await db.pool.query("INSERT INTO clash_players VALUES ($1, $2);", [await this.getCurrentSeasonId(), who.id]);
	}

	async quitPlayer(who: GuildMember): Promise<void> {
		if (!(await this.isPlayerSigned(who))) return;

		await db.pool.query("DELETE FROM clash_players WHERE player_id=$1;", [who.id]);
	}

	async isPlayerSigned(who: GuildMember): Promise<boolean> {
		return (await db.pool.query("SELECT player_id FROM clash_players WHERE player_id=$1 AND clash_id=$2;", [who.id, await this.getCurrentSeasonId()])).rowCount > 0;
	}

	async pickUnit(player: GuildMember, pick: Unit): Promise<void> {
		await db.pool.query("INSERT INTO clash_picked_units VALUES ($1, $2, $3);", [await this.getCurrentSeasonId(), pick.id, player.id]);
	}

	async tradeUnit(p1: GuildMember, p2: GuildMember, offer: Unit, request: Unit): Promise<void> {
		if (!(await this.hasUnit(p1, offer)) || !(await this.hasUnit(p2, request))) return;

		await db.pool.query("UPDATE clash_picked_units SET unit_id=$1 WHERE unit_id=$2 AND player_id=$3;", [offer.id, request.id, p1.id]);
		await db.pool.query("UPDATE clash_picked_units SET unit_id=$1 WHERE unit_id=$2 AND player_id=$3;", [request.id, offer.id, p2.id]);
	}

	async changeUnit(player: GuildMember, offer: Unit, wanted: Unit): Promise<void> {
		if (!(await this.hasUnit(player, offer)) || (await this.hasUnit(player, wanted))) return;

		await db.pool.query("UPDATE clash_picked_units SET unit_id=$1 WHERE unit_id=$2 AND player_id=$3;", [offer.id, wanted.id, player.id]);
	}

	async hasUnit(player: GuildMember, check: Unit): Promise<boolean> {
		return (
			(await db.pool.query("SELECT unit_id FROM clash_picked_units WHERE player_id=$1 AND clash_id=$2;", [player.id, await this.getCurrentSeasonId()])).rows.indexOf(
				check.id.toString()
			) !== -1
		);
	}

	async getPlayers(guild: Guild): Promise<GuildMember[]> {
		return await Promise.all(
			(
				await db.pool.query("SELECT player_id FROM clash_players WHERE clash_id=$1;", [await this.getCurrentSeasonId()])
			).rows.map(async row => await guild.members.fetch(row.player_id))
		);
	}

	async getCurrentSeasonName(): Promise<string> {
		return (await db.pool.query("SELECT season_name, MAX(season_id) FROM clashs GROUP BY season_id;")).rows.map(row => row.season_name)[0];
	}

	async getCurrentSeasonId(): Promise<number> {
		return (await db.pool.query("SELECT MAX(season_id) as s_id FROM clashs GROUP BY season_id;")).rows.map(row => row.s_id)[0];
	}

	refreshTask(): Promise<void> {
		throw new Error("Method not implemented.");
	}
}

export default new DraftDataHandler();
