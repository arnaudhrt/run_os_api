import { PoolClient } from "pg";
import { db } from "@/shared/database/database";
import { CreateTrainingCycleInput, PhaseInput, PhaseModel, TrainingCycleModel, UpdateTrainingCycleInput } from "./training-cycle.model";

export class TrainingCycleData {
  private static async getPhasesByCycleIds(cycleIds: string[]): Promise<PhaseModel[]> {
    if (cycleIds.length === 0) return [];
    const result = await db.query(
      `SELECT * FROM phases WHERE cycle_id = ANY($1) ORDER BY "order" ASC`,
      [cycleIds]
    );
    return result.rows;
  }

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

    const cycles = result.rows;
    const cycleIds = cycles.map((c: TrainingCycleModel) => c.id);
    const phases = await this.getPhasesByCycleIds(cycleIds);

    return cycles.map((cycle: TrainingCycleModel) => ({
      ...cycle,
      phases: phases.filter((p: PhaseModel) => p.cycle_id === cycle.id),
    }));
  }

  public static async getTrainingCycleById(id: string, userId: string): Promise<TrainingCycleModel | null> {
    const result = await db.query("SELECT * FROM training_cycles WHERE id = $1 AND user_id = $2", [id, userId]);
    if (!result.rows[0]) return null;

    const phases = await this.getPhasesByCycleIds([id]);
    return {
      ...result.rows[0],
      phases,
    };
  }

  public static async getRaceDateById(raceId: string, userId: string): Promise<string | null> {
    const result = await db.query("SELECT race_date FROM races WHERE id = $1 AND user_id = $2", [raceId, userId]);
    return result.rows[0]?.race_date || null;
  }

  public static async createTrainingCycleWithPhases(cycle: CreateTrainingCycleInput, phases: PhaseInput[]): Promise<string> {
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
           VALUES ($1, $2, $3, $4)`,
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
