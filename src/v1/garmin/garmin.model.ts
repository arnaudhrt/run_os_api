// Garmin activity types from garmin-connect library
export type GarminActivityType =
  | "running"
  | "trail_running"
  | "treadmill_running"
  | "indoor_running"
  | "walking"
  | "hiking"
  | "cycling"
  | "indoor_cycling"
  | "mountain_biking"
  | "gravel_cycling"
  | "swimming"
  | "open_water_swimming"
  | "lap_swimming"
  | "strength_training"
  | "cardio"
  | "yoga"
  | "pilates"
  | "other";

// Garmin activity structure from the API
export interface GarminActivity {
  activityId: number;
  activityName?: string;
  activityType: {
    typeId?: number;
    typeKey: string;
    parentTypeId?: number;
    sortOrder?: number;
  };
  startTimeLocal: string;
  startTimeGMT: string;
  duration: number; // seconds
  elapsedDuration?: number; // seconds (total including pauses)
  movingDuration?: number; // seconds
  distance: number; // meters
  elevationGain?: number;
  elevationLoss?: number;
  averageSpeed?: number; // m/s
  maxSpeed?: number; // m/s
  averageHR?: number;
  maxHR?: number;
  averageRunningCadenceInStepsPerMinute?: number;
  steps?: number;
  calories?: number;
  description?: string;

  // Temperature
  minTemperature?: number; // Celsius
  maxTemperature?: number; // Celsius

  // Training effect
  aerobicTrainingEffect?: number;
  anaerobicTrainingEffect?: number;
  trainingEffectLabel?: string;

  // Heart rate zones (time in seconds)
  hrTimeInZone_1?: number;
  hrTimeInZone_2?: number;
  hrTimeInZone_3?: number;
  hrTimeInZone_4?: number;
  hrTimeInZone_5?: number;

  // PR flag
  pr?: boolean;

  // Additional fields
  beginTimestamp?: number;
  sportTypeId?: number;
  avgPower?: number;
  normPower?: number;
}

export interface GarminAccountModel {
  id: string;
  user_id: string;
  garmin_email: string;
  garmin_password_encrypted: string;
  oauth1_token?: object;
  oauth2_token?: object;
  last_sync_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateGarminAccountModel {
  user_id: string;
  garmin_email: string;
  garmin_password_encrypted: string;
  oauth1_token?: object;
  oauth2_token?: object;
}

export interface UpdateGarminAccountModel {
  garmin_email?: string;
  garmin_password_encrypted?: string;
  oauth1_token?: object;
  oauth2_token?: object;
  last_sync_at?: Date;
}

export interface GarminConnectionStatus {
  connected: boolean;
  email?: string;
  last_sync_at?: Date;
}

export interface GarminConnectRequest {
  email: string;
  password: string;
}
