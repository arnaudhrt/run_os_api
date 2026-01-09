export type StravaSportType =
  | "AlpineSki"
  | "BackcountrySki"
  | "Badminton"
  | "Canoeing"
  | "Crossfit"
  | "EBikeRide"
  | "Elliptical"
  | "EMountainBikeRide"
  | "Golf"
  | "GravelRide"
  | "Handcycle"
  | "HighIntensityIntervalTraining"
  | "Hike"
  | "IceSkate"
  | "InlineSkate"
  | "Kayaking"
  | "Kitesurf"
  | "MountainBikeRide"
  | "NordicSki"
  | "Pickleball"
  | "Pilates"
  | "Racquetball"
  | "Ride"
  | "RockClimbing"
  | "RollerSki"
  | "Rowing"
  | "Run"
  | "Sail"
  | "Skateboard"
  | "Snowboard"
  | "Snowshoe"
  | "Soccer"
  | "Squash"
  | "StairStepper"
  | "StandUpPaddling"
  | "Surfing"
  | "Swim"
  | "TableTennis"
  | "Tennis"
  | "TrailRun"
  | "Velomobile"
  | "VirtualRide"
  | "VirtualRow"
  | "VirtualRun"
  | "Walk"
  | "WeightTraining"
  | "Wheelchair"
  | "Windsurf"
  | "Workout"
  | "Yoga";

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

export interface StravaAthlete {
  id: number;
  username: string | null;
  firstname: string;
  lastname: string;
  city: string | null;
  state: string | null;
  country: string | null;
  sex: "M" | "F" | null;
  premium: boolean;
  summit: boolean;
  created_at: string;
  updated_at: string;
  profile_medium: string;
  profile: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: StravaSportType;
  start_date: string;
  start_date_local: string;
  timezone: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  suffer_score?: number;
  average_cadence?: number;
  calories?: number;
  elev_high?: number;
  elev_low?: number;
  workout_type?: number;
  description?: string;
  average_temp?: number;
  pr_count: number;
}

export interface StravaAccountModel {
  id: string;
  user_id: string;
  strava_athlete_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  scope?: string;
  last_sync_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStravaAccountModel {
  user_id: string;
  strava_athlete_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  scope?: string;
}

export interface UpdateStravaAccountModel {
  access_token?: string;
  refresh_token?: string;
  expires_at?: Date;
  scope?: string;
  last_sync_at?: Date;
}

export interface StravaTokenUpdate {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface StravaCallbackQuery {
  code?: string;
  error?: string;
  scope?: string;
  state?: string;
}

export interface StravaConnectionStatus {
  connected: boolean;
  athlete?: {
    id: number;
    firstname: string;
    lastname: string;
  };
  last_sync_at?: Date;
}
