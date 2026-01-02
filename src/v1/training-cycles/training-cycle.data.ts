import { PoolClient } from "pg";
import { db } from "@/shared/database/database";
import { CreateTrainingCycleInput, PhaseInput, TrainingCycleModel, UpdateTrainingCycleInput } from "./training-cycle.model";

export class TrainingCycleData {
  public static async getAllTrainingCycles(userId: string, years: string[]): Promise<TrainingCycleModel[]> {
    const result = await db.query(
      `SELECT * FROM training_cycles
       WHERE user_id = $1
       AND (
         EXTRACT(YEAR FROM start_date) = ANY($2::int[])
         OR EXTRACT(YEAR FROM end_date) = ANY($2::int[])
       )
       ORDER BY start_date ASC`,
      [userId, years]
    );
    return result.rows;
  }

  public static async getTrainingCycleById(id: string, userId: string): Promise<TrainingCycleModel | null> {
    const result = await db.query("SELECT * FROM training_cycles WHERE id = $1 AND user_id = $2", [id, userId]);
    return result.rows[0] || null;
  }

  public static async getRaceDateById(raceId: string, userId: string): Promise<string | null> {
    const result = await db.query("SELECT race_date FROM races WHERE id = $1 AND user_id = $2", [raceId, userId]);
    return result.rows[0]?.race_date || null;
  }

  public static async createTrainingCycleWithPhases(cycle: CreateTrainingCycleInput, phases: (PhaseInput & { order: number })[]): Promise<string> {
    return db.transaction(async (client: PoolClient) => {
      const cycleResult = await client.query(
        `INSERT INTO training_cycles (user_id, race_id, name, start_date, end_date, total_weeks)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [cycle.user_id, cycle.race_id || null, cycle.name, cycle.start_date, cycle.end_date, cycle.total_weeks]
      );

      const cycleId = cycleResult.rows[0].id;

      for (const phase of phases) {
        await client.query(
          `INSERT INTO phases (cycle_id, phase_type, "order", duration_weeks)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [cycleId, phase.phase_type, phase.order, phase.duration_weeks]
        );
      }

      return cycleId;
    });
  }

  public static async updateTrainingCycle(id: string, data: UpdateTrainingCycleInput): Promise<void> {
    await db.query("UPDATE training_cycles SET name = $1 WHERE id = $2", [data.name, id]);
  }

  public static async deleteTrainingCycle(id: string): Promise<void> {
    await db.query("DELETE FROM training_cycles WHERE id = $1", [id]);
  }
}
