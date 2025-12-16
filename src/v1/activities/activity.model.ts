import { ActivityType, WorkoutType } from "@/shared/models/types";

export interface ActivityModel {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  workout_type: WorkoutType;
  start_time: string;

  // Metrics
  distance_meters?: number;
  duration_seconds?: number;
  elevation_gain_meters?: number;
  elevation_loss_meters?: number;

  // Heart rate
  avg_heart_rate?: number;
  max_heart_rate?: number;

  // Pace
  avg_pace_min_per_km?: number;
  best_pace_min_per_km?: number;

  // Cadence
  avg_cadence?: number;

  // User inputs
  rpe?: number;
  notes?: string;

  // Weather
  avg_temperature_celsius?: number;

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
  activity: ActivityModel | null;
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
    activitiesCount: number;
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
    activitiesCount: number;
  };
}

export interface YearEntry {
  year: number;
  months: MonthEntry[] | null; // null if all months are empty
  totals: {
    distance_meters: number;
    duration_seconds: number;
    elevation_gain_meters: number;
    activitiesCount: number;
  };
}

export interface StructuredActivitiesLog {
  years: YearEntry[];
  totals: {
    distance_meters: number;
    duration_seconds: number;
    elevation_gain_meters: number;
    activitiesCount: number;
  };
}
