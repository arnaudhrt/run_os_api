// ============================================
// API Types for React/Vite Frontend
// Generated from run_os_api endpoints
// ============================================

// ============================================
// Enums / Literal Types
// ============================================

export type PhaseType = "base" | "build" | "peak" | "taper" | "recovery" | "off";
export type ActivityType = "run" | "trail" | "treadmill" | "walk" | "hike" | "bike" | "swim" | "strength" | "cross_training";
export type RaceType = "run" | "half_marathon" | "marathon" | "ultra_marathon" | "triathlon" | "trail" | "ultra_trail";
export type WorkoutType = "easy_run" | "hills" | "long_run" | "tempo" | "threshold" | "intervals" | "race" | "other";

// ============================================
// Base API Response
// ============================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// Auth Models
// ============================================

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  firebase_uid: string;
  garmin_user_id?: string;
  strava_athlete_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  firebase_uid: string;
  garmin_user_id?: string;
  strava_athlete_id?: number;
}

// ============================================
// Season Models
// ============================================

export interface Season {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Race {
  id: string;
  season_id: string;
  name: string;
  race_date: string;
  distance_meters?: number;
  elevation_gain_meters?: number;
  target_time_seconds?: number;
  location?: string;
  race_type: RaceType;
  priority: 1 | 2 | 3;
  notes?: string;
  result_time_seconds?: number;
  result_place?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Phase {
  id: string;
  race_id: string;
  phase_type: PhaseType;
  start_date: string;
  end_date: string;
  description?: string;
  weekly_volume_target_km?: number;
  weekly_elevation_target_m?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSeasonRequest {
  name: string;
  start_date: string;
  end_date: string;
}

export interface CreateRaceRequest {
  season_id: string;
  name: string;
  race_date: string;
  distance_meters?: number;
  elevation_gain_meters?: number;
  target_time_seconds?: number;
  location?: string;
  race_type: RaceType;
  priority: 1 | 2 | 3;
  notes?: string;
}

export interface CreatePhaseRequest {
  race_id: string;
  phase_type: PhaseType;
  start_date: string;
  end_date: string;
  description?: string;
  weekly_volume_target_km?: number;
  weekly_elevation_target_m?: number;
}

export interface UpdateSeasonRequest {
  name?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateRaceRequest {
  name?: string;
  race_date?: string;
  distance_meters?: number;
  elevation_gain_meters?: number;
  target_time_seconds?: number;
  location?: string;
  race_type?: RaceType;
  priority?: 1 | 2 | 3;
  notes?: string;
  result_time_seconds?: number;
  result_place?: string;
  is_completed?: boolean;
}

export interface UpdatePhaseRequest {
  phase_type?: PhaseType;
  start_date?: string;
  end_date?: string;
  description?: string;
  weekly_volume_target_km?: number;
  weekly_elevation_target_m?: number;
}

// ============================================
// Activity Models
// ============================================

export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  workout_type: WorkoutType;
  start_time: string;
  distance_meters?: number;
  duration_seconds?: number;
  elevation_gain_meters?: number;
  elevation_loss_meters?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_pace_min_per_km?: number;
  best_pace_min_per_km?: number;
  avg_cadence?: number;
  rpe?: number;
  notes?: string;
  avg_temperature_celsius?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityRequest {
  activity_type: ActivityType;
  workout_type: WorkoutType;
  start_time: string;
  distance_meters?: number;
  duration_seconds?: number;
  elevation_gain_meters?: number;
  elevation_loss_meters?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_pace_min_per_km?: number;
  best_pace_min_per_km?: number;
  avg_cadence?: number;
  rpe?: number;
  notes?: string;
  avg_temperature_celsius?: number;
}

export interface UpdateActivityRequest {
  activity_type?: ActivityType;
  workout_type?: WorkoutType;
  start_time?: string;
  distance_meters?: number;
  duration_seconds?: number;
  elevation_gain_meters?: number;
  elevation_loss_meters?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_pace_min_per_km?: number;
  best_pace_min_per_km?: number;
  avg_cadence?: number;
  rpe?: number;
  notes?: string;
  avg_temperature_celsius?: number;
}

// ============================================
// Structured Activities Log (for Log Page)
// ============================================

export interface Totals {
  distance_meters: number;
  duration_seconds: number;
  elevation_gain_meters: number;
  activitiesCount: number;
}

export interface DayEntry {
  date: string; // ISO date string (YYYY-MM-DD)
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isRestDay: boolean;
  activity: Activity | null;
}

export interface WeekEntry {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: DayEntry[] | null; // null if all 7 days are rest days
  totals: Totals;
}

export interface MonthEntry {
  month: number; // 1-12
  monthName: string;
  weeks: WeekEntry[] | null; // null if all weeks are empty
  totals: Totals;
}

export interface YearEntry {
  year: number;
  months: MonthEntry[] | null; // null if all months are empty
  totals: Totals;
}

export interface StructuredActivitiesLog {
  years: YearEntry[];
  totals: Totals;
}

// ============================================
// API Endpoint Response Types
// ============================================

// Auth endpoints
export type GetUserResponse = ApiResponse<User>;
export type RegisterUserResponse = ApiResponse<void>;

// Season endpoints
export type GetActiveSeasonResponse = ApiResponse<Season | null>;
export type GetSeasonByIdResponse = ApiResponse<Season>;
export type CreateSeasonResponse = ApiResponse<{ id: string }>;
export type UpdateSeasonResponse = ApiResponse<void>;
export type DeleteSeasonResponse = ApiResponse<void>;

// Race endpoints
export type CreateRaceResponse = ApiResponse<{ id: string }>;
export type UpdateRaceResponse = ApiResponse<void>;
export type DeleteRaceResponse = ApiResponse<void>;

// Phase endpoints
export type CreatePhaseResponse = ApiResponse<{ id: string }>;
export type UpdatePhaseResponse = ApiResponse<void>;
export type DeletePhaseResponse = ApiResponse<void>;

// Activity endpoints
export type GetAllActivitiesResponse = ApiResponse<StructuredActivitiesLog>;
export type SearchActivitiesResponse = ApiResponse<Activity[]>;
export type CreateActivityResponse = ApiResponse<{ id: string }>;
export type CreateBulkActivityResponse = ApiResponse<{ ids: string[] }>;
export type UpdateActivityResponse = ApiResponse<void>;
export type DeleteActivityResponse = ApiResponse<void>;
