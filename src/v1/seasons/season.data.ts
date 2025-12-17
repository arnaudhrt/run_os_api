import { db } from "@/shared/database/database";
import {
  SeasonModel,
  RaceModel,
  PhaseModel,
  CreateSeasonWithUserModel,
  CreateRaceModel,
  CreatePhaseModel,
  UpdateSeasonModel,
  UpdateRaceModel,
  UpdatePhaseModel,
  SeasonWithRacesModel,
} from "./season.model";

export class SeasonData {
  // Season queries
  public static async getActiveSeasonByUserId(userId: string): Promise<SeasonModel | null> {
    const now = new Date().toISOString();
    const result = await db.query(
      `SELECT * FROM seasons
       WHERE user_id = $1
       AND start_date <= $2
       AND end_date >= $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, now]
    );
    return result.rows[0] || null;
  }

  public static async getActiveSeasonWithRacesByUserId(userId: string): Promise<SeasonWithRacesModel | null> {
    const now = new Date().toISOString();
    const result = await db.query(
      `SELECT
        s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
              'season_id', r.season_id,
              'name', r.name,
              'race_date', r.race_date,
              'distance_meters', r.distance_meters,
              'elevation_gain_meters', r.elevation_gain_meters,
              'target_time_seconds', r.target_time_seconds,
              'location', r.location,
              'race_type', r.race_type,
              'priority', r.priority,
              'notes', r.notes,
              'result_time_seconds', r.result_time_seconds,
              'result_place', r.result_place,
              'is_completed', r.is_completed,
              'created_at', r.created_at,
              'updated_at', r.updated_at,
              'phases', COALESCE(
                (SELECT json_agg(
                  json_build_object(
                    'id', p.id,
                    'race_id', p.race_id,
                    'phase_type', p.phase_type,
                    'start_date', p.start_date,
                    'end_date', p.end_date,
                    'description', p.description,
                    'weekly_volume_target_km', p.weekly_volume_target_km,
                    'weekly_elevation_target_m', p.weekly_elevation_target_m,
                    'created_at', p.created_at,
                    'updated_at', p.updated_at
                  ) ORDER BY p.start_date ASC
                ) FROM phases p WHERE p.race_id = r.id),
                '[]'::json
              )
            ) ORDER BY r.race_date ASC
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'::json
        ) as races
      FROM seasons s
      LEFT JOIN races r ON r.season_id = s.id
      WHERE s.user_id = $1
        AND s.start_date <= $2
        AND s.end_date >= $2
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 1`,
      [userId, now]
    );

    if (!result.rows[0]) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      start_date: row.start_date,
      end_date: row.end_date,
      created_at: row.created_at,
      updated_at: row.updated_at,
      races: row.races,
    };
  }

  public static async getSeasonById(id: string): Promise<SeasonModel | null> {
    const result = await db.query("SELECT * FROM seasons WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  public static async createSeason(data: CreateSeasonWithUserModel): Promise<string> {
    const { user_id, name, start_date, end_date } = data;

    const result = await db.query(
      `INSERT INTO seasons (user_id, name, start_date, end_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [user_id, name, start_date, end_date]
    );

    return result.rows[0].id;
  }

  public static async updateSeason(id: string, data: UpdateSeasonModel): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.start_date !== undefined) {
      fields.push(`start_date = $${paramIndex++}`);
      values.push(data.start_date);
    }
    if (data.end_date !== undefined) {
      fields.push(`end_date = $${paramIndex++}`);
      values.push(data.end_date);
    }

    if (fields.length === 0) return;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await db.query(
      `UPDATE seasons SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
      values
    );
  }

  public static async deleteSeason(id: string): Promise<void> {
    await db.query("DELETE FROM seasons WHERE id = $1", [id]);
  }

  // Race queries
  public static async getRaceById(id: string): Promise<RaceModel | null> {
    const result = await db.query("SELECT * FROM races WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  public static async getRacesBySeasonId(seasonId: string): Promise<RaceModel[]> {
    const result = await db.query(
      "SELECT * FROM races WHERE season_id = $1 ORDER BY race_date ASC",
      [seasonId]
    );
    return result.rows;
  }

  public static async createRace(data: CreateRaceModel): Promise<string> {
    const {
      season_id,
      name,
      race_date,
      distance_meters,
      elevation_gain_meters,
      target_time_seconds,
      location,
      race_type,
      priority,
      notes,
    } = data;

    const result = await db.query(
      `INSERT INTO races (
        season_id, name, race_date, distance_meters, elevation_gain_meters,
        target_time_seconds, location, race_type, priority, notes
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        season_id,
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
      result_place: "result_place",
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

    await db.query(
      `UPDATE races SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
      values
    );
  }

  public static async deleteRace(id: string): Promise<void> {
    await db.query("DELETE FROM races WHERE id = $1", [id]);
  }

  // Phase queries
  public static async getPhaseById(id: string): Promise<PhaseModel | null> {
    const result = await db.query("SELECT * FROM phases WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  public static async getPhasesByRaceId(raceId: string): Promise<PhaseModel[]> {
    const result = await db.query(
      "SELECT * FROM phases WHERE race_id = $1 ORDER BY start_date ASC",
      [raceId]
    );
    return result.rows;
  }

  public static async createPhase(data: CreatePhaseModel): Promise<string> {
    const {
      race_id,
      phase_type,
      start_date,
      end_date,
      description,
      weekly_volume_target_km,
      weekly_elevation_target_m,
    } = data;

    const result = await db.query(
      `INSERT INTO phases (
        race_id, phase_type, start_date, end_date, description,
        weekly_volume_target_km, weekly_elevation_target_m
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        race_id,
        phase_type,
        start_date,
        end_date,
        description || null,
        weekly_volume_target_km || null,
        weekly_elevation_target_m || null,
      ]
    );

    return result.rows[0].id;
  }

  public static async updatePhase(id: string, data: UpdatePhaseModel): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, keyof UpdatePhaseModel> = {
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

    await db.query(
      `UPDATE phases SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
      values
    );
  }

  public static async deletePhase(id: string): Promise<void> {
    await db.query("DELETE FROM phases WHERE id = $1", [id]);
  }
}
