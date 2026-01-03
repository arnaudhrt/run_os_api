import { db } from "@/shared/database/database";
import { RaceModel, CreateRaceModel, UpdateRaceModel } from "./race.model";

export class RaceData {
  public static async getAllRaces(userId: string): Promise<RaceModel[]> {
    const result = await db.query("SELECT * FROM races WHERE user_id = $1 ORDER BY race_date ASC", [userId]);
    return result.rows;
  }

  public static async getRaceById(id: string, userId: string): Promise<RaceModel | null> {
    const result = await db.query("SELECT * FROM races WHERE id = $1 AND user_id = $2", [id, userId]);
    return result.rows[0] || null;
  }

  public static async createRace(data: CreateRaceModel): Promise<string> {
    const { user_id, name, race_date, distance_meters, elevation_gain_meters, target_time_seconds, location, race_type, priority, notes } = data;

    const result = await db.query(
      `INSERT INTO races (
        user_id, name, race_date, distance_meters, elevation_gain_meters,
        target_time_seconds, location, race_type, priority, notes
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        user_id,
        name,
        race_date,
        distance_meters || null,
        elevation_gain_meters || null,
        target_time_seconds || null,
        location || null,
        race_type,
        priority,
        notes || null,
      ]
    );

    return result.rows[0].id;
  }

  public static async updateRace(id: string, data: UpdateRaceModel): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, keyof UpdateRaceModel> = {
      name: "name",
      race_date: "race_date",
      distance_meters: "distance_meters",
      elevation_gain_meters: "elevation_gain_meters",
      target_time_seconds: "target_time_seconds",
      location: "location",
      race_type: "race_type",
      priority: "priority",
      notes: "notes",
      result_time_seconds: "result_time_seconds",
      result_place_overall: "result_place_overall",
      result_place_gender: "result_place_gender",
      result_place_category: "result_place_category",
      category_name: "category_name",
      is_completed: "is_completed",
    };

    for (const [dbField, dataKey] of Object.entries(fieldMap)) {
      if (data[dataKey] !== undefined) {
        fields.push(`${dbField} = $${paramIndex++}`);
        values.push(data[dataKey]);
      }
    }

    if (fields.length === 0) return;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await db.query(`UPDATE races SET ${fields.join(", ")} WHERE id = $${paramIndex}`, values);
  }

  public static async deleteRace(id: string): Promise<void> {
    await db.query("DELETE FROM races WHERE id = $1", [id]);
  }
}
