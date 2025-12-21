import { CreateActivityWithUserModel } from "@/v1/activities/activity.model";
import { ActivityType } from "@/shared/models/types";
import { GarminActivity } from "./garmin.model";

/**
 * Convert Garmin activity type to our ActivityType
 */
function mapGarminTypeToActivityType(typeKey: string): ActivityType {
  const type = typeKey.toLowerCase();

  // Running activities
  if (type.includes("running") && !type.includes("trail")) return "run";
  if (type.includes("trail_running") || type.includes("trail")) return "trail";
  if (type.includes("treadmill")) return "treadmill";

  // Walking/Hiking
  if (type.includes("walking") || type.includes("walk")) return "walk";
  if (type.includes("hiking") || type.includes("hike")) return "hike";

  // Cycling
  if (type.includes("cycling") || type.includes("biking") || type.includes("bike")) return "bike";

  // Swimming
  if (type.includes("swimming") || type.includes("swim")) return "swim";

  // Strength
  if (type.includes("strength") || type.includes("weight")) return "strength";

  return "cross_training";
}

/**
 * Calculate average temperature from min/max
 */
function calculateAvgTemperature(min?: number, max?: number): number | undefined {
  if (min !== undefined && max !== undefined) {
    return (min + max) / 2;
  }
  return min ?? max;
}

/**
 * Round HR zone time to integer seconds
 */
function roundZoneTime(time?: number): number | undefined {
  return time !== undefined ? Math.round(time) : undefined;
}

/**
 * Convert Garmin activities to our activity model format
 */
export function convertGarminActivities(garminActivities: GarminActivity[], userId: string): CreateActivityWithUserModel[] {
  return garminActivities.map((ga) => {
    const activityType = mapGarminTypeToActivityType(ga.activityType?.typeKey || "");

    return {
      user_id: userId,
      source: "garmin" as const,
      garmin_activity_id: String(ga.activityId),

      activity_type: activityType,
      workout_type: "uncategorized" as const,
      start_time: `${ga.startTimeGMT.replace(" ", "T")}Z`,

      distance_meters: ga.distance ? Math.round(ga.distance) : undefined,
      duration_seconds: ga.duration ? Math.round(ga.duration) : undefined,
      elapsed_duration_seconds: ga.elapsedDuration ? Math.round(ga.elapsedDuration) : undefined,

      elevation_gain_meters: ga.elevationGain,
      elevation_loss_meters: ga.elevationLoss,

      avg_heart_rate: ga.averageHR,
      max_heart_rate: ga.maxHR,

      avg_speed_mps: ga.averageSpeed,
      max_speed_mps: ga.maxSpeed,

      steps: ga.steps,
      avg_cadence: ga.averageRunningCadenceInStepsPerMinute ? Math.round(ga.averageRunningCadenceInStepsPerMinute) : undefined,

      calories: ga.calories,

      aerobic_training_effect: ga.aerobicTrainingEffect,
      anaerobic_training_effect: ga.anaerobicTrainingEffect,
      training_effect_label: ga.trainingEffectLabel,

      time_in_zone_1: roundZoneTime(ga.hrTimeInZone_1),
      time_in_zone_2: roundZoneTime(ga.hrTimeInZone_2),
      time_in_zone_3: roundZoneTime(ga.hrTimeInZone_3),
      time_in_zone_4: roundZoneTime(ga.hrTimeInZone_4),
      time_in_zone_5: roundZoneTime(ga.hrTimeInZone_5),

      avg_temperature_celsius: calculateAvgTemperature(ga.minTemperature, ga.maxTemperature),

      is_pr: ga.pr ?? false,

      notes: "",
    };
  });
}
