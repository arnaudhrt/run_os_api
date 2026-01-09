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
    const result = await db.query(
      `INSERT INTO activities (
        user_id, source, garmin_activity_id, strava_activity_id,
        activity_type, workout_type, start_time,
        distance_meters, duration_seconds, elevation_gain_meters,
        avg_heart_rate, max_heart_rate, avg_temperature_celsius,
        is_pr, has_pain, rpe, notes, shoes_id
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING id`,
      [
        data.user_id,
        data.source,
        data.garmin_activity_id || null,
        data.strava_activity_id || null,
        data.activity_type,
        data.workout_type,
        data.start_time,
        data.distance_meters || null,
        data.duration_seconds || null,
        data.elevation_gain_meters || null,
        data.avg_heart_rate || null,
        data.max_heart_rate || null,
        data.avg_temperature_celsius || null,
        data.is_pr || false,
        data.has_pain || null,
        data.rpe || null,
        data.notes || null,
        data.shoes_id || null,
      ]
    );

    return result.rows[0].id;
  }

  public static async createBulk(activities: CreateActivityWithUserModel[]): Promise<string[]> {
    const ids: string[] = [];

    await db.transaction(async (client) => {
      for (const activity of activities) {
        try {
          const result = await client.query(
            `INSERT INTO activities (
              user_id, source, garmin_activity_id, strava_activity_id,
              activity_type, workout_type, start_time,
              distance_meters, duration_seconds, elevation_gain_meters,
              avg_heart_rate, max_heart_rate, avg_temperature_celsius,
              is_pr, has_pain, rpe, notes, shoes_id
            )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
             ON CONFLICT (garmin_activity_id) WHERE garmin_activity_id IS NOT NULL DO NOTHING
             RETURNING id`,
            [
              activity.user_id,
              activity.source,
              activity.garmin_activity_id || null,
              activity.strava_activity_id || null,
              activity.activity_type,
              activity.workout_type,
              activity.start_time,
              activity.distance_meters || null,
              activity.duration_seconds || null,
              activity.elevation_gain_meters || null,
              activity.avg_heart_rate || null,
              activity.max_heart_rate || null,
              activity.avg_temperature_celsius || null,
              activity.is_pr || false,
              activity.has_pain || null,
              activity.rpe || null,
              activity.notes || null,
              activity.shoes_id || null,
            ]
          );
          if (result.rows[0]?.id) {
            ids.push(result.rows[0].id);
          }
        } catch (error) {
          // Skip duplicate entries (unique constraint violation on user_id + start_time)
          if ((error as { code?: string }).code === "23505") {
            continue;
          }
          throw error;
        }
      }
    });

    return ids;
  }

  public static async update(id: string, data: UpdateActivityModel): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, keyof UpdateActivityModel> = {
      source: "source",
      garmin_activity_id: "garmin_activity_id",
      strava_activity_id: "strava_activity_id",
      activity_type: "activity_type",
      workout_type: "workout_type",
      start_time: "start_time",
      distance_meters: "distance_meters",
      duration_seconds: "duration_seconds",
      elevation_gain_meters: "elevation_gain_meters",
      avg_heart_rate: "avg_heart_rate",
      max_heart_rate: "max_heart_rate",
      avg_temperature_celsius: "avg_temperature_celsius",
      is_pr: "is_pr",
      has_pain: "has_pain",
      rpe: "rpe",
      notes: "notes",
      shoes_id: "shoes_id",
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

  public static async getDateRange(userId: string): Promise<{ minDate: string | null; maxDate: string | null }> {
    const result = await db.query(
      "SELECT MIN(DATE(start_time)) as min_date, MAX(DATE(start_time)) as max_date FROM activities WHERE user_id = $1",
      [userId]
    );
    return {
      minDate: result.rows[0]?.min_date || null,
      maxDate: result.rows[0]?.max_date || null,
    };
  }

  public static async getWeeklyStatsRaw(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ week: string; volume: string; elevation: string; time: string }[]> {
    const result = await db.query(
      `SELECT
        TO_CHAR(start_time, 'IYYY') || 'W' || TO_CHAR(start_time, 'IW') as week,
        COALESCE(SUM(distance_meters), 0) as volume,
        COALESCE(SUM(elevation_gain_meters), 0) as elevation,
        COALESCE(SUM(duration_seconds), 0) as time
      FROM activities
      WHERE user_id = $1
        AND start_time >= $2
        AND start_time < $3
      GROUP BY TO_CHAR(start_time, 'IYYY'), TO_CHAR(start_time, 'IW')
      ORDER BY TO_CHAR(start_time, 'IYYY'), TO_CHAR(start_time, 'IW')`,
      [userId, startDate.toISOString(), endDate.toISOString()]
    );

    return result.rows;
  }
}
