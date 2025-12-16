import { db } from "@/shared/database/database";
import {
  ActivityModel,
  ActivitySearchParams,
  CreateActivityWithUserModel,
  UpdateActivityModel,
} from "./activity.model";

export class ActivityData {
  public static async getAllByUserId(userId: string): Promise<ActivityModel[]> {
    const result = await db.query(
      "SELECT * FROM activities WHERE user_id = $1 ORDER BY start_time DESC",
      [userId]
    );
    return result.rows;
  }

  public static async getById(id: string): Promise<ActivityModel | null> {
    const result = await db.query("SELECT * FROM activities WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  public static async search(userId: string, params: ActivitySearchParams): Promise<ActivityModel[]> {
    const conditions: string[] = ["user_id = $1"];
    const values: unknown[] = [userId];
    let paramIndex = 2;

    if (params.activity_type) {
      conditions.push(`activity_type = $${paramIndex++}`);
      values.push(params.activity_type);
    }

    if (params.workout_type) {
      conditions.push(`workout_type = $${paramIndex++}`);
      values.push(params.workout_type);
    }

    const result = await db.query(
      `SELECT * FROM activities WHERE ${conditions.join(" AND ")} ORDER BY start_time DESC`,
      values
    );
    return result.rows;
  }

  public static async create(data: CreateActivityWithUserModel): Promise<string> {
    const {
      user_id,
      activity_type,
      workout_type,
      start_time,
      distance_meters,
      duration_seconds,
      elevation_gain_meters,
      elevation_loss_meters,
      avg_heart_rate,
      max_heart_rate,
      avg_pace_min_per_km,
      best_pace_min_per_km,
      avg_cadence,
      rpe,
      notes,
      avg_temperature_celsius,
    } = data;

    const result = await db.query(
      `INSERT INTO activities (
        user_id, activity_type, workout_type, start_time,
        distance_meters, duration_seconds, elevation_gain_meters, elevation_loss_meters,
        avg_heart_rate, max_heart_rate, avg_pace_min_per_km, best_pace_min_per_km,
        avg_cadence, rpe, notes, avg_temperature_celsius
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id`,
      [
        user_id,
        activity_type,
        workout_type,
        start_time,
        distance_meters || null,
        duration_seconds || null,
        elevation_gain_meters || null,
        elevation_loss_meters || null,
        avg_heart_rate || null,
        max_heart_rate || null,
        avg_pace_min_per_km || null,
        best_pace_min_per_km || null,
        avg_cadence || null,
        rpe || null,
        notes || null,
        avg_temperature_celsius || null,
      ]
    );

    return result.rows[0].id;
  }

  public static async createBulk(activities: CreateActivityWithUserModel[]): Promise<string[]> {
    const ids: string[] = [];

    await db.transaction(async (client) => {
      for (const activity of activities) {
        const result = await client.query(
          `INSERT INTO activities (
            user_id, activity_type, workout_type, start_time,
            distance_meters, duration_seconds, elevation_gain_meters, elevation_loss_meters,
            avg_heart_rate, max_heart_rate, avg_pace_min_per_km, best_pace_min_per_km,
            avg_cadence, rpe, notes, avg_temperature_celsius
          )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           RETURNING id`,
          [
            activity.user_id,
            activity.activity_type,
            activity.workout_type,
            activity.start_time,
            activity.distance_meters || null,
            activity.duration_seconds || null,
            activity.elevation_gain_meters || null,
            activity.elevation_loss_meters || null,
            activity.avg_heart_rate || null,
            activity.max_heart_rate || null,
            activity.avg_pace_min_per_km || null,
            activity.best_pace_min_per_km || null,
            activity.avg_cadence || null,
            activity.rpe || null,
            activity.notes || null,
            activity.avg_temperature_celsius || null,
          ]
        );
        ids.push(result.rows[0].id);
      }
    });

    return ids;
  }

  public static async update(id: string, data: UpdateActivityModel): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, keyof UpdateActivityModel> = {
      activity_type: "activity_type",
      workout_type: "workout_type",
      start_time: "start_time",
      distance_meters: "distance_meters",
      duration_seconds: "duration_seconds",
      elevation_gain_meters: "elevation_gain_meters",
      elevation_loss_meters: "elevation_loss_meters",
      avg_heart_rate: "avg_heart_rate",
      max_heart_rate: "max_heart_rate",
      avg_pace_min_per_km: "avg_pace_min_per_km",
      best_pace_min_per_km: "best_pace_min_per_km",
      avg_cadence: "avg_cadence",
      rpe: "rpe",
      notes: "notes",
      avg_temperature_celsius: "avg_temperature_celsius",
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
      `UPDATE activities SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
      values
    );
  }

  public static async delete(id: string): Promise<void> {
    await db.query("DELETE FROM activities WHERE id = $1", [id]);
  }
}
