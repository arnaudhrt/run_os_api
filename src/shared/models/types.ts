export type PhaseType = "base" | "build" | "peak" | "taper" | "recovery" | "off";

export type ActivityType = "run" | "trail" | "treadmill" | "walk" | "hike" | "bike" | "swim" | "strength" | "cross_training";

export type RaceType = "run" | "half_marathon" | "marathon" | "ultra_marathon" | "triathlon" | "trail" | "ultra_trail";

export type WorkoutType = "easy_run" | "hills" | "long_run" | "tempo" | "threshold" | "intervals" | "race" | "uncategorized" | "other";

export type DataSource = "manual" | "strava" | "garmin";

export type RecordType = "distance" | "trail" | "performance";

export type ChatRole = "user" | "assistant" | "system";

export type SyncStatus = "running" | "completed" | "failed";

export type ActivitySource = "manual" | "strava" | "garmin";

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
