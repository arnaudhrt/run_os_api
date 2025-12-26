import { CreateActivityWithUserModel } from "@/v1/activities/activity.model";
import { ActivityType, WorkoutType } from "@/shared/models/types";
import { StravaActivity } from "./strava.model";

/**
 * Convert Strava activity type to our ActivityType
 */
function mapStravaTypeToActivityType(stravaType: string, sportType: string): ActivityType {
  const type = sportType.toLowerCase() || stravaType.toLowerCase();

  if (type.includes("run")) return "run";
  if (type.includes("trail")) return "trail";
  if (type.includes("treadmill")) return "treadmill";
  if (type.includes("hike")) return "hike";
  if (type.includes("ride") || type.includes("bike") || type.includes("cycling")) return "bike";
  if (type.includes("swim")) return "swim";
  if (type.includes("weight") || type.includes("strength")) return "strength";

  return "cross_training";
}

/**
 * Convert Strava workout_type to our WorkoutType
 * Strava workout_type for runs: 0=default, 1=race, 2=long run, 3=workout
 */
function mapStravaWorkoutType(workoutType?: number): WorkoutType {
  switch (workoutType) {
    case 1:
      return "race";
    case 2:
      return "long_run";
    case 3:
      return "intervals";
    default:
      return "other";
  }
}

/**
 * Convert Strava activities to our activity model format
 */
export function convertStravaActivities(stravaActivities: StravaActivity[], userId: string): CreateActivityWithUserModel[] {
  return stravaActivities.map((sa) => {
    const activityType = mapStravaTypeToActivityType(sa.type, sa.sport_type);

    return {
      user_id: userId,
      source: "strava" as const,
      strava_activity_id: sa.id,

      activity_type: activityType,
      workout_type: mapStravaWorkoutType(sa.workout_type),
      start_time: sa.start_date,

      distance_meters: sa.distance ? Math.round(sa.distance) : undefined,
      duration_seconds: sa.moving_time,
      elapsed_duration_seconds: sa.elapsed_time,

      elevation_gain_meters: sa.total_elevation_gain ? Math.round(sa.total_elevation_gain) : undefined,

      avg_heart_rate: sa.average_heartrate ? Math.round(sa.average_heartrate) : undefined,
      max_heart_rate: sa.max_heartrate ? Math.round(sa.max_heartrate) : undefined,

      avg_speed_mps: sa.average_speed,
      max_speed_mps: sa.max_speed,

      avg_cadence: sa.average_cadence ? Math.round(sa.average_cadence * 2) : undefined,
      calories: sa.calories,

      notes: sa.description,
    };
  });
}
