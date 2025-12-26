import { db } from "@/shared/database/database";
import {
  PlannedWorkoutModel,
  CreatePlannedWorkoutWithUserModel,
  UpdatePlannedWorkoutModel,
  PlannedWorkoutDateRangeParams,
} from "./planned-workout.model";

export class PlannedWorkoutData {
  public static async getByDateRange(
    userId: string,
    params: PlannedWorkoutDateRangeParams
  ): Promise<PlannedWorkoutModel[]> {
    const result = await db.query(
      `SELECT * FROM planned_workouts
       WHERE user_id = $1 AND planned_date >= $2 AND planned_date <= $3
       ORDER BY planned_date ASC, time_slot ASC`,
      [userId, params.start, params.end]
    );
    return result.rows;
  }

  public static async getById(id: string): Promise<PlannedWorkoutModel | null> {
    const result = await db.query("SELECT * FROM planned_workouts WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  public static async create(data: CreatePlannedWorkoutWithUserModel): Promise<string> {
    const result = await db.query(
      `INSERT INTO planned_workouts (
        user_id, planned_date, time_slot, activity_type, workout_type,
        target_distance_meters, target_duration_seconds, description, activity_id
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        data.user_id,
        data.planned_date,
        data.time_slot,
        data.activity_type,
        data.workout_type,
        data.target_distance_meters || null,
        data.target_duration_seconds || null,
        data.description || null,
        data.activity_id || null,
      ]
    );
    return result.rows[0].id;
  }

  public static async update(id: string, data: UpdatePlannedWorkoutModel): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, keyof UpdatePlannedWorkoutModel> = {
      planned_date: "planned_date",
      time_slot: "time_slot",
      activity_type: "activity_type",
      workout_type: "workout_type",
      target_distance_meters: "target_distance_meters",
      target_duration_seconds: "target_duration_seconds",
      description: "description",
      activity_id: "activity_id",
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

    await db.query(
      `UPDATE planned_workouts SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
      values
    );
  }

  public static async linkActivity(id: string, activityId: string): Promise<void> {
    await db.query(
      `UPDATE planned_workouts SET activity_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [activityId, id]
    );
  }

  public static async delete(id: string): Promise<void> {
    await db.query("DELETE FROM planned_workouts WHERE id = $1", [id]);
  }
}
