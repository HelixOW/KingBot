import IUnitDataHandler from "../../interfaces/i-unit-data-handler";
import { unitCache } from "../../utilities/cache";
import { databaseHandler as db } from "../../utilities/database-handler";
import { DBUnit } from "../../types/unit";
import { Unit, Type, Race, Grade, Event, Affection } from "../../models/unit";

export default class UnitDataHandler implements IUnitDataHandler {
	async refreshTask(): Promise<void> {
		setInterval(async () => {
			await this.readUnits();
		}, 1000 * 60 * 10);
	}

	async readUnits(): Promise<boolean> {
		(await db.pool.query("SELECT * FROM public.units ORDER BY unit_id")).rows.forEach(async (unit: DBUnit) => {
			const addNames = (await db.pool.query("SELECT additional_name FROM public.other_unit_names WHERE unit_id=$1", [unit.unit_id])).rows.map(row => row.additional_name);

			await unitCache.set(
				unit.unit_id.toString(),
				new Unit(
					unit.unit_id,

					unit.unit_name,
					unit.simple_name,
					unit.variational_name,
					addNames,

					Type.fromString(unit.unit_type),
					Grade.fromString(unit.grade),
					Race.fromString(unit.race),
					Event.fromString(unit.unit_event),
					Affection.fromString(unit.affection),

					unit.banner === null ? [] : unit.banner.split(","),
					unit.emoji,
					unit.icon_url
				)
			);
		});

		return true;
	}

	async registerUnit(unit: Unit): Promise<boolean> {
		unitCache.set(unit.id.toString(), unit);

		await db.pool.query(
			"INSERT INTO units (unit_name, simple_name, variational_name, unit_type, grade, race, unit_event, affection, banner, emoji, icon_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
			[
				unit.name,
				unit.simpleName,
				unit.variationName,
				unit.type.toString(),
				unit.grade.toString(),
				unit.race.toString(),
				unit.event.toString(),
				unit.affection.toString(),
				unit.homeBanners.join(","),
				"",
				"",
			]
		);
		return true;
	}

	async newestUnitId(): Promise<number> {
		return await (
			await db.pool.query("SELECT unit_id FROM units ORDER BY unit_id DESC")
		).rows[0].unitId;
	}
}
