// Define const arrays first, then derive types from them

export const phaseTypes = ["base", "build", "peak", "taper", "recovery", "off"] as const;
export type PhaseType = (typeof phaseTypes)[number];

export const activityTypes = ["run", "trail", "treadmill", "hike", "strength", "cardio"] as const;
export type ActivityType = (typeof activityTypes)[number];

export const raceTypes = ["run", "5k", "10k", "half_marathon", "marathon", "ultra_marathon", "trail", "ultra_trail"] as const;
export type RaceType = (typeof raceTypes)[number];

export const runningWorkoutTypes = ["base_run", "hills", "long_run", "tempo", "threshold", "intervals", "race", "other"] as const;
export type RunningWorkoutType = (typeof runningWorkoutTypes)[number];

export const strengthWorkoutTypes = ["push", "pull", "legs", "back", "chest", "shoulders", "abs", "arms", "upper_body", "lower_body", "full_body"] as const;
export type StrengthWorkoutType = (typeof strengthWorkoutTypes)[number];

export const allWorkoutTypes = [...runningWorkoutTypes, ...strengthWorkoutTypes] as const;
export type WorkoutType = RunningWorkoutType | StrengthWorkoutType;

export const recordTypes = ["distance", "trail", "performance"] as const;
export type RecordType = (typeof recordTypes)[number];

export const chatRoles = ["user", "assistant", "system"] as const;
export type ChatRole = (typeof chatRoles)[number];

export const syncStatuses = ["running", "completed", "failed"] as const;
export type SyncStatus = (typeof syncStatuses)[number];

export const dataSources = ["manual", "strava", "garmin"] as const;
export type DataSource = (typeof dataSources)[number];

export const timeSlots = ["am", "pm", "single"] as const;
export type TimeSlot = (typeof timeSlots)[number];

// Extend Express Request type to include user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
      };
      dbUser?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        firebase_uid: string;
        garmin_user_id?: string;
        strava_athlete_id?: number;
        created_at: string;
        updated_at: string;
      };
    }
  }
}
