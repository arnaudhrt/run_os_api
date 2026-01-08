import { CreateActivityWithUserModel } from "@/v1/activities/activity.model";
import { ActivityType } from "@/shared/models/types";
import { GarminActivity } from "./garmin.model";

/**
 * Convert Garmin activity type to our ActivityType
 */
export function mapGarminTypeToActivityType(typeKey: string): ActivityType {
  const type = typeKey.toLowerCase();

  // Running activities
  if (type.includes("treadmill")) return "treadmill";
  if (type.includes("trail_running") || type.includes("trail")) return "trail";
  if (type.includes("running") && !type.includes("trail")) return "run";

  // Hiking
  if (type.includes("hiking") || type.includes("hike")) return "hike";

  // Strength
  if (type.includes("strength") || type.includes("weight")) return "strength";

  return "cardio";
}

/**
 * Calculate average temperature from min/max
 */
export function calculateAvgTemperature(min?: number, max?: number): number | undefined {
  if (min !== undefined && max !== undefined) {
    return (min + max) / 2;
  }
  return min ?? max;
}

/**
 * Convert a single Garmin activity to our activity model format
 */
export function convertGarminActivity(ga: GarminActivity, userId: string): CreateActivityWithUserModel {
  const activityType = mapGarminTypeToActivityType(ga.activityType?.typeKey || "");

  return {
    user_id: userId,
    source: "garmin" as const,
    garmin_activity_id: String(ga.activityId),

    activity_type: activityType,
    workout_type: null,
    start_time: `${ga.startTimeGMT.replace(" ", "T")}Z`,

    distance_meters: ga.distance ? Math.round(ga.distance) : undefined,
    duration_seconds: ga.duration ? Math.round(ga.duration) : undefined,
    elevation_gain_meters: ga.elevationGain ? Math.round(ga.elevationGain) : undefined,

    avg_heart_rate: ga.averageHR ? Math.round(ga.averageHR) : undefined,
    max_heart_rate: ga.maxHR ? Math.round(ga.maxHR) : undefined,

    avg_temperature_celsius: calculateAvgTemperature(ga.minTemperature, ga.maxTemperature),

    is_pr: !!ga.pr,
  };
}

/**
 * Convert Garmin activities to our activity model format
 */
export function convertGarminActivities(garminActivities: GarminActivity[], userId: string): CreateActivityWithUserModel[] {
  return garminActivities.map((ga) => convertGarminActivity(ga, userId));
}
