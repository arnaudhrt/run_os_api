import { ActivityType, DataSource, StrengthWorkoutType, RunningWorkoutType } from "@/shared/models/types";

export interface ActivityModel {
  id: string;
  user_id: string;
  source: DataSource;
  garmin_activity_id?: string;
  strava_activity_id?: number;

  activity_type: ActivityType;
  workout_type?: StrengthWorkoutType | RunningWorkoutType | null;
  start_time: string;

  distance_meters?: number;
  duration_seconds?: number;

  elevation_gain_meters?: number;

  avg_heart_rate?: number;
  max_heart_rate?: number;

  avg_temperature_celsius?: number;

  is_pr?: boolean;
  has_pain?: string;
  rpe?: number;
  notes?: string;
  shoes_id?: string;

  created_at: string;
  updated_at: string;
}

export interface ActivitySearchParams {
  activity_type?: ActivityType;
  workout_type?: StrengthWorkoutType | RunningWorkoutType;
}

export type CreateActivityModel = Omit<ActivityModel, "id" | "user_id" | "created_at" | "updated_at">;
export type CreateActivityWithUserModel = Omit<ActivityModel, "id" | "created_at" | "updated_at">;
export type UpdateActivityModel = Partial<Omit<ActivityModel, "id" | "user_id" | "created_at" | "updated_at">>;

export interface WeeklyStats {
  week: string; // format: "2025W1"
  volume: number; // distance in km
  elevation: number; // elevation gain in meters
  time: number; // duration in seconds
}
