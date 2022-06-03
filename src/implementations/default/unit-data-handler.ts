import IUnitDataHandler from "../../interfaces/i-unit-data-handler";
import { unitCache } from "../../utilities/cache";
import { databaseHandler as db } from "../../utilities/database-handler";
import { Unit, Type, Race, Grade, Event, Affection } from "../../models/unit";

export class UnitDataHandler implements IUnitDataHandler {
	async refreshTask(): Promise<void> {
		setInterval(async () => {
			await this.readUnits();
		}, 1000 * 60 * 10);
	}

	async readUnits(): Promise<boolean> {
		unitCache.clear();

		await Promise.all(
			(
				await db.pool.query("SELECT * FROM public.units ORDER BY unit_id")
			).rows.map(async unit => {
				const addNames = (await db.pool.query("SELECT additional_name FROM public.other_unit_names WHERE unit_id=$1", [unit.unit_id])).rows.map(row => row.additional_name);

				unitCache.set(
					unit.unit_id.toString(),
					(
						await new Unit(
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
						).fetchIcon()
					).loadIcon()
				);

				console.log(`Loaded Unit ${unit.unit_name} (${unit.unit_id})`);
			})
		);

		return true;
	}

	async registerUnit(rUnit: Unit): Promise<boolean> {
		unitCache.set(rUnit.id.toString(), rUnit);

		await db.pool.query(
			"INSERT INTO units (unit_name, simple_name, variational_name, unit_type, grade, race, unit_event, affection, banner, emoji, icon_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);",
			[
				rUnit.name,
				rUnit.simpleName,
				rUnit.variationName,
				rUnit.type.toString(),
				rUnit.grade.toString(),
				rUnit.race.toString(),
				rUnit.event.toString(),
				rUnit.affection.toString(),
				rUnit.homeBanners.length === 0 ? null : rUnit.homeBanners.join(","),
				null,
				rUnit.iconURL,
			]
		);

		(await db.pool.query("SELECT * FROM public.units WHERE unit_name=$1", [rUnit.name])).rows.map(async unit => {
			await Promise.all(
				[...rUnit.altNames].map(async (altName: string) => {
					await db.pool.query("INSERT INTO other_unit_names (unit_id, additional_name) VALUES ($1, $2);", [unit.unit_id, altName]);
				})
			);

			unitCache.set(
				unit.unit_id.toString(),
				(
					await new Unit(
						unit.unit_id,

						unit.unit_name,
						unit.simple_name,
						unit.variational_name,
						rUnit.altNames,

						Type.fromString(unit.unit_type),
						Grade.fromString(unit.grade),
						Race.fromString(unit.race),
						Event.fromString(unit.unit_event),
						Affection.fromString(unit.affection),

						unit.banner === null ? [] : unit.banner.split(","),
						unit.emoji,
						unit.icon_url
					).fetchIcon()
				).loadIcon()
			);

			console.log(`Loaded Unit ${unit.unit_name} (${unit.unit_id})`);
		});

		return true;
	}

	async editUnit(unit: Unit, key: string, value: string): Promise<boolean> {
		if (key === "altnames") {
			await db.pool.query("DROP * FROM other_unit_names WHERE unit_id=$1;", [unit.id]);
			await Promise.all(
				[...unit.altNames].map(async (altName: string) => {
					await db.pool.query("INSERT INTO other_unit_names (unit_id, additional_name) VALUES ($1, $2);", [unit.id, altName]);
				})
			);
			return true;
		}
		await db.pool.query("UPDATE units SET " + key + "=$1 WHERE unit_id=$2;", [value, unit.id]);

		return true;
	}

	async newestUnitId(): Promise<number> {
		return await (
			await db.pool.query("SELECT unit_id FROM units ORDER BY unit_id DESC;")
		).rows[0].unitId;
	}
}

export default new UnitDataHandler();
