import { describe, it, expect } from "vitest";
import {
  mapGarminTypeToActivityType,
  calculateAvgTemperature,
  convertGarminActivity,
  convertGarminActivities,
} from "../garmin.utils";
import { GarminActivity } from "../garmin.model";

describe("Garmin Utils", () => {
  describe("mapGarminTypeToActivityType", () => {
    it("maps treadmill activities", () => {
      expect(mapGarminTypeToActivityType("treadmill_running")).toBe("treadmill");
      expect(mapGarminTypeToActivityType("TREADMILL")).toBe("treadmill");
    });

    it("maps trail running activities", () => {
      expect(mapGarminTypeToActivityType("trail_running")).toBe("trail");
      expect(mapGarminTypeToActivityType("TRAIL_RUNNING")).toBe("trail");
    });

    it("maps regular running activities", () => {
      expect(mapGarminTypeToActivityType("running")).toBe("run");
      expect(mapGarminTypeToActivityType("RUNNING")).toBe("run");
    });

    it("maps hiking activities", () => {
      expect(mapGarminTypeToActivityType("hiking")).toBe("hike");
      expect(mapGarminTypeToActivityType("hike")).toBe("hike");
      expect(mapGarminTypeToActivityType("HIKING")).toBe("hike");
    });

    it("maps strength activities", () => {
      expect(mapGarminTypeToActivityType("strength_training")).toBe("strength");
      expect(mapGarminTypeToActivityType("weight_training")).toBe("strength");
    });

    it("defaults to cardio for unknown types", () => {
      expect(mapGarminTypeToActivityType("swimming")).toBe("cardio");
      expect(mapGarminTypeToActivityType("cycling")).toBe("cardio");
      expect(mapGarminTypeToActivityType("yoga")).toBe("cardio");
      expect(mapGarminTypeToActivityType("")).toBe("cardio");
    });

    it("prioritizes trail over running when both present", () => {
      expect(mapGarminTypeToActivityType("trail_running")).toBe("trail");
    });
  });

  describe("calculateAvgTemperature", () => {
    it("calculates average when both min and max provided", () => {
      expect(calculateAvgTemperature(10, 20)).toBe(15);
      expect(calculateAvgTemperature(0, 30)).toBe(15);
      expect(calculateAvgTemperature(-5, 5)).toBe(0);
    });

    it("returns min when only min provided", () => {
      expect(calculateAvgTemperature(15, undefined)).toBe(15);
    });

    it("returns max when only max provided", () => {
      expect(calculateAvgTemperature(undefined, 20)).toBe(20);
    });

    it("returns undefined when neither provided", () => {
      expect(calculateAvgTemperature(undefined, undefined)).toBeUndefined();
    });
  });

  describe("convertGarminActivity", () => {
    const baseGarminActivity: GarminActivity = {
      activityId: 12345,
      activityType: { typeKey: "running" },
      startTimeLocal: "2025-01-08 10:00:00",
      startTimeGMT: "2025-01-08 09:00:00",
      duration: 3600,
      distance: 10000,
    };

    it("converts basic activity fields", () => {
      const result = convertGarminActivity(baseGarminActivity, "user-123");

      expect(result.user_id).toBe("user-123");
      expect(result.source).toBe("garmin");
      expect(result.garmin_activity_id).toBe("12345");
      expect(result.activity_type).toBe("run");
      expect(result.workout_type).toBeNull();
      expect(result.start_time).toBe("2025-01-08T09:00:00Z");
    });

    it("rounds distance to integer", () => {
      const activity = { ...baseGarminActivity, distance: 10234.56 };
      const result = convertGarminActivity(activity, "user-123");
      expect(result.distance_meters).toBe(10235);
    });

    it("rounds duration to integer", () => {
      const activity = { ...baseGarminActivity, duration: 3661.7 };
      const result = convertGarminActivity(activity, "user-123");
      expect(result.duration_seconds).toBe(3662);
    });

    it("rounds elevation to integer", () => {
      const activity = { ...baseGarminActivity, elevationGain: 150.8 };
      const result = convertGarminActivity(activity, "user-123");
      expect(result.elevation_gain_meters).toBe(151);
    });

    it("rounds heart rate to integer", () => {
      const activity = { ...baseGarminActivity, averageHR: 145.5, maxHR: 175.3 };
      const result = convertGarminActivity(activity, "user-123");
      expect(result.avg_heart_rate).toBe(146);
      expect(result.max_heart_rate).toBe(175);
    });

    it("calculates average temperature from min/max", () => {
      const activity = { ...baseGarminActivity, minTemperature: 10, maxTemperature: 20 };
      const result = convertGarminActivity(activity, "user-123");
      expect(result.avg_temperature_celsius).toBe(15);
    });

    it("sets is_pr correctly", () => {
      const withPr = { ...baseGarminActivity, pr: true };
      expect(convertGarminActivity(withPr, "user-123").is_pr).toBe(true);

      const withoutPr = { ...baseGarminActivity, pr: false };
      expect(convertGarminActivity(withoutPr, "user-123").is_pr).toBe(false);

      const noPr = { ...baseGarminActivity };
      expect(convertGarminActivity(noPr, "user-123").is_pr).toBe(false);
    });

    it("handles missing optional fields", () => {
      const result = convertGarminActivity(baseGarminActivity, "user-123");
      expect(result.elevation_gain_meters).toBeUndefined();
      expect(result.avg_heart_rate).toBeUndefined();
      expect(result.max_heart_rate).toBeUndefined();
      expect(result.avg_temperature_celsius).toBeUndefined();
    });

    it("formats start_time correctly with space in GMT time", () => {
      const activity = { ...baseGarminActivity, startTimeGMT: "2025-01-08 14:30:00" };
      const result = convertGarminActivity(activity, "user-123");
      expect(result.start_time).toBe("2025-01-08T14:30:00Z");
    });
  });

  describe("convertGarminActivities", () => {
    it("converts multiple activities", () => {
      const activities: GarminActivity[] = [
        {
          activityId: 1,
          activityType: { typeKey: "running" },
          startTimeLocal: "2025-01-08 10:00:00",
          startTimeGMT: "2025-01-08 09:00:00",
          duration: 3600,
          distance: 10000,
        },
        {
          activityId: 2,
          activityType: { typeKey: "hiking" },
          startTimeLocal: "2025-01-09 10:00:00",
          startTimeGMT: "2025-01-09 09:00:00",
          duration: 7200,
          distance: 15000,
        },
      ];

      const result = convertGarminActivities(activities, "user-123");

      expect(result).toHaveLength(2);
      expect(result[0].garmin_activity_id).toBe("1");
      expect(result[0].activity_type).toBe("run");
      expect(result[1].garmin_activity_id).toBe("2");
      expect(result[1].activity_type).toBe("hike");
    });

    it("returns empty array for empty input", () => {
      const result = convertGarminActivities([], "user-123");
      expect(result).toHaveLength(0);
    });
  });
});
