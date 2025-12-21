import { db } from "@/shared/database/database";
import { PhaseModel, CreatePhaseModel, UpdatePhaseModel } from "./phase.model";

export class PhaseData {
  public static async getAllPhases(userId: string): Promise<PhaseModel[]> {
    const result = await db.query("SELECT * FROM phases WHERE user_id = $1 ORDER BY start_date ASC", [userId]);
    return result.rows;
  }

  public static async getPhaseById(id: string, userId: string): Promise<PhaseModel | null> {
    const result = await db.query("SELECT * FROM phases WHERE id = $1 AND user_id = $2", [id, userId]);
    return result.rows[0] || null;
  }

  public static async createPhase(data: CreatePhaseModel): Promise<string> {
    const { user_id, race_id, phase_type, start_date, end_date, description, weekly_volume_target_km, weekly_elevation_target_m } = data;

    const result = await db.query(
      `INSERT INTO phases (
        user_id, race_id, phase_type, start_date, end_date, description,
        weekly_volume_target_km, weekly_elevation_target_m
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [user_id, race_id || null, phase_type, start_date, end_date, description || null, weekly_volume_target_km || null, weekly_elevation_target_m || null]
    );

    return result.rows[0].id;
  }

  public static async updatePhase(id: string, data: UpdatePhaseModel): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, keyof UpdatePhaseModel> = {
      race_id: "race_id",
      phase_type: "phase_type",
      start_date: "start_date",
      end_date: "end_date",
      description: "description",
      weekly_volume_target_km: "weekly_volume_target_km",
      weekly_elevation_target_m: "weekly_elevation_target_m",
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

    await db.query(`UPDATE phases SET ${fields.join(", ")} WHERE id = $${paramIndex}`, values);
  }

  public static async deletePhase(id: string): Promise<void> {
    await db.query("DELETE FROM phases WHERE id = $1", [id]);
  }
}
