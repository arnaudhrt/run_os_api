import { db } from "@/shared/database/database";
import { PhaseModel, CreatePhaseModel, UpdatePhaseModel } from "./phase.model";

export class PhaseData {
  public static async getPhasesByCycleId(cycleId: string): Promise<PhaseModel[]> {
    const result = await db.query('SELECT * FROM phases WHERE cycle_id = $1 ORDER BY "order" ASC', [cycleId]);
    return result.rows;
  }

  public static async getPhaseById(id: string): Promise<PhaseModel | null> {
    const result = await db.query("SELECT * FROM phases WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  public static async createPhase(data: CreatePhaseModel): Promise<string> {
    const { cycle_id, phase_type, order, duration_weeks } = data;

    const result = await db.query(
      `INSERT INTO phases (cycle_id, phase_type, "order", duration_weeks)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [cycle_id, phase_type, order, duration_weeks]
    );

    return result.rows[0].id;
  }

  public static async updatePhase(id: string, data: UpdatePhaseModel): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, keyof UpdatePhaseModel> = {
      phase_type: "phase_type",
      '"order"': "order",
      duration_weeks: "duration_weeks",
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

  public static async deletePhasesByCycleId(cycleId: string): Promise<void> {
    await db.query("DELETE FROM phases WHERE cycle_id = $1", [cycleId]);
  }
}
