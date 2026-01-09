import { CreateActivityWithUserModel } from "@/v1/activities/activity.model";
import { ActivityType } from "@/shared/models/types";
import { StravaActivity } from "./strava.model";

/**
 * Convert Strava activity type to our ActivityType
 */
function mapStravaTypeToActivityType(stravaType: string, sportType: string): ActivityType {
  const type = sportType.toLowerCase() || stravaType.toLowerCase();

  if (type.includes("trail")) return "trail";
  if (type.includes("treadmill")) return "treadmill";
  if (type.includes("run")) return "run";
  if (type.includes("hike")) return "hike";
  if (type.includes("weight") || type.includes("strength")) return "strength";

  return "cardio";
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
      workout_type: null,
      start_time: sa.start_date,

      distance_meters: sa.distance ? Math.round(sa.distance) : undefined,
      duration_seconds: sa.moving_time,

      elevation_gain_meters: sa.total_elevation_gain ? Math.round(sa.total_elevation_gain) : undefined,

      avg_heart_rate: sa.average_heartrate ? Math.round(sa.average_heartrate) : undefined,
      max_heart_rate: sa.max_heartrate ? Math.round(sa.max_heartrate) : undefined,

      notes: sa.description,
      is_pr: sa.pr_count > 0,
    };
  });
}
