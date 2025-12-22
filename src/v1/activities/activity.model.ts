import { ActivityType, ActivitySource, WorkoutType } from "@/shared/models/types";

export interface ActivityModel {
  id: string;
  user_id: string;
  source: ActivitySource;
  garmin_activity_id?: string;
  strava_activity_id?: number;

  activity_type: ActivityType;
  workout_type: WorkoutType;
  start_time: string;

  distance_meters?: number;
  duration_seconds?: number;
  elapsed_duration_seconds?: number;

  elevation_gain_meters?: number;
  elevation_loss_meters?: number;

  avg_heart_rate?: number;
  max_heart_rate?: number;

  avg_speed_mps?: number;
  max_speed_mps?: number;

  steps?: number;
  avg_cadence?: number;

  calories?: number;

  aerobic_training_effect?: number;
  anaerobic_training_effect?: number;
  training_effect_label?: string;

  time_in_zone_1?: number;
  time_in_zone_2?: number;
  time_in_zone_3?: number;
  time_in_zone_4?: number;
  time_in_zone_5?: number;

  avg_temperature_celsius?: number;

  is_pr?: boolean;

  rpe?: number;
  notes?: string;

  created_at: string;
  updated_at: string;
}

export interface ActivitySearchParams {
  activity_type?: ActivityType;
  workout_type?: WorkoutType;
}

export type CreateActivityModel = Omit<ActivityModel, "id" | "user_id" | "created_at" | "updated_at">;
export type CreateActivityWithUserModel = Omit<ActivityModel, "id" | "created_at" | "updated_at">;
export type UpdateActivityModel = Partial<Omit<ActivityModel, "id" | "user_id" | "created_at" | "updated_at">>;

// Structured log response models
export interface DayEntry {
  date: string; // ISO date string (YYYY-MM-DD)
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isRestDay: boolean;
  activities: ActivityModel[] | null;
}

export interface WeekEntry {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: DayEntry[] | null; // null if all 7 days are rest days
  totals: {
    distance_meters: number;
    duration_seconds: number;
    elevation_gain_meters: number;
    activities_count: number;
  };
}

export interface MonthEntry {
  month: number; // 1-12
  monthName: string;
  weeks: WeekEntry[] | null; // null if all weeks are empty
  totals: {
    distance_meters: number;
    duration_seconds: number;
    elevation_gain_meters: number;
    activities_count: number;
  };
}

export interface YearEntry {
  year: number;
  months: MonthEntry[] | null; // null if all months are empty
  totals: {
    distance_meters: number;
    duration_seconds: number;
    elevation_gain_meters: number;
    activities_count: number;
    races_count: number;
  };
}

export interface StructuredActivitiesLog {
  years: YearEntry[];
  totals: {
    distance_meters: number;
    duration_seconds: number;
    elevation_gain_meters: number;
    activities_count: number;
    races_count: number;
  };
}
