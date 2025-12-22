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
        distance_meters, duration_seconds, elapsed_duration_seconds,
        elevation_gain_meters, elevation_loss_meters,
        avg_heart_rate, max_heart_rate,
        avg_speed_mps, max_speed_mps,
        steps, avg_cadence, calories,
        aerobic_training_effect, anaerobic_training_effect, training_effect_label,
        time_in_zone_1, time_in_zone_2, time_in_zone_3, time_in_zone_4, time_in_zone_5,
        avg_temperature_celsius, is_pr, rpe, notes
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
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
        data.elapsed_duration_seconds || null,
        data.elevation_gain_meters || null,
        data.elevation_loss_meters || null,
        data.avg_heart_rate || null,
        data.max_heart_rate || null,
        data.avg_speed_mps || null,
        data.max_speed_mps || null,
        data.steps || null,
        data.avg_cadence || null,
        data.calories || null,
        data.aerobic_training_effect || null,
        data.anaerobic_training_effect || null,
        data.training_effect_label || null,
        data.time_in_zone_1 || null,
        data.time_in_zone_2 || null,
        data.time_in_zone_3 || null,
        data.time_in_zone_4 || null,
        data.time_in_zone_5 || null,
        data.avg_temperature_celsius || null,
        data.is_pr || false,
        data.rpe || null,
        data.notes || null,
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
            user_id, source, garmin_activity_id, strava_activity_id,
            activity_type, workout_type, start_time,
            distance_meters, duration_seconds, elapsed_duration_seconds,
            elevation_gain_meters, elevation_loss_meters,
            avg_heart_rate, max_heart_rate,
            avg_speed_mps, max_speed_mps,
            steps, avg_cadence, calories,
            aerobic_training_effect, anaerobic_training_effect, training_effect_label,
            time_in_zone_1, time_in_zone_2, time_in_zone_3, time_in_zone_4, time_in_zone_5,
            avg_temperature_celsius, is_pr, rpe, notes
          )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
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
            activity.elapsed_duration_seconds || null,
            activity.elevation_gain_meters || null,
            activity.elevation_loss_meters || null,
            activity.avg_heart_rate || null,
            activity.max_heart_rate || null,
            activity.avg_speed_mps || null,
            activity.max_speed_mps || null,
            activity.steps || null,
            activity.avg_cadence || null,
            activity.calories || null,
            activity.aerobic_training_effect || null,
            activity.anaerobic_training_effect || null,
            activity.training_effect_label || null,
            activity.time_in_zone_1 || null,
            activity.time_in_zone_2 || null,
            activity.time_in_zone_3 || null,
            activity.time_in_zone_4 || null,
            activity.time_in_zone_5 || null,
            activity.avg_temperature_celsius || null,
            activity.is_pr || false,
            activity.rpe || null,
            activity.notes || null,
          ]
        );
        if (result.rows[0]?.id) {
          ids.push(result.rows[0].id);
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
      elapsed_duration_seconds: "elapsed_duration_seconds",
      elevation_gain_meters: "elevation_gain_meters",
      elevation_loss_meters: "elevation_loss_meters",
      avg_heart_rate: "avg_heart_rate",
      max_heart_rate: "max_heart_rate",
      avg_speed_mps: "avg_speed_mps",
      max_speed_mps: "max_speed_mps",
      steps: "steps",
      avg_cadence: "avg_cadence",
      calories: "calories",
      aerobic_training_effect: "aerobic_training_effect",
      anaerobic_training_effect: "anaerobic_training_effect",
      training_effect_label: "training_effect_label",
      time_in_zone_1: "time_in_zone_1",
      time_in_zone_2: "time_in_zone_2",
      time_in_zone_3: "time_in_zone_3",
      time_in_zone_4: "time_in_zone_4",
      time_in_zone_5: "time_in_zone_5",
      avg_temperature_celsius: "avg_temperature_celsius",
      is_pr: "is_pr",
      rpe: "rpe",
      notes: "notes",
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
}
