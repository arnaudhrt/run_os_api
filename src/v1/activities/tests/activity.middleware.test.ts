import { describe, it, expect } from "vitest";
import {
  createActivitySchema,
  createBulkActivitySchema,
  updateActivitySchema,
} from "../activity.middleware";

describe("Activity Validation Schemas", () => {
  describe("createActivitySchema", () => {
    it("accepts valid activity with required fields only", () => {
      const validActivity = {
        activity_type: "run",
        start_time: "2025-01-08T10:00:00Z",
      };

      const result = createActivitySchema.safeParse(validActivity);
      expect(result.success).toBe(true);
    });

    it("accepts valid activity with all fields", () => {
      const validActivity = {
        source: "garmin",
        garmin_activity_id: "123456",
        activity_type: "run",
        workout_type: "long_run",
        start_time: "2025-01-08T10:00:00Z",
        distance_meters: 10000,
        duration_seconds: 3600,
        elevation_gain_meters: 150,
        avg_heart_rate: 145,
        max_heart_rate: 175,
        avg_temperature_celsius: 15,
        is_pr: true,
        has_pain: "knee",
        rpe: 7,
        notes: "Great run!",
        shoes_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = createActivitySchema.safeParse(validActivity);
      expect(result.success).toBe(true);
    });

    it("rejects missing activity_type", () => {
      const invalid = {
        start_time: "2025-01-08T10:00:00Z",
      };

      const result = createActivitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects missing start_time", () => {
      const invalid = {
        activity_type: "run",
      };

      const result = createActivitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid activity_type", () => {
      const invalid = {
        activity_type: "swimming",
        start_time: "2025-01-08T10:00:00Z",
      };

      const result = createActivitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid workout_type", () => {
      const invalid = {
        activity_type: "run",
        workout_type: "invalid_type",
        start_time: "2025-01-08T10:00:00Z",
      };

      const result = createActivitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("accepts null workout_type", () => {
      const valid = {
        activity_type: "run",
        workout_type: null,
        start_time: "2025-01-08T10:00:00Z",
      };

      const result = createActivitySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects negative distance_meters", () => {
      const invalid = {
        activity_type: "run",
        start_time: "2025-01-08T10:00:00Z",
        distance_meters: -100,
      };

      const result = createActivitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects rpe out of range (< 1)", () => {
      const invalid = {
        activity_type: "run",
        start_time: "2025-01-08T10:00:00Z",
        rpe: 0,
      };

      const result = createActivitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects rpe out of range (> 10)", () => {
      const invalid = {
        activity_type: "run",
        start_time: "2025-01-08T10:00:00Z",
        rpe: 11,
      };

      const result = createActivitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid shoes_id (not UUID)", () => {
      const invalid = {
        activity_type: "run",
        start_time: "2025-01-08T10:00:00Z",
        shoes_id: "not-a-uuid",
      };

      const result = createActivitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid source", () => {
      const invalid = {
        activity_type: "run",
        start_time: "2025-01-08T10:00:00Z",
        source: "apple_watch",
      };

      const result = createActivitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("accepts all valid activity types", () => {
      const activityTypes = ["run", "trail", "treadmill", "hike", "strength", "cardio"];

      for (const type of activityTypes) {
        const result = createActivitySchema.safeParse({
          activity_type: type,
          start_time: "2025-01-08T10:00:00Z",
        });
        expect(result.success, `Failed for activity_type: ${type}`).toBe(true);
      }
    });

    it("accepts all valid data sources", () => {
      const sources = ["manual", "strava", "garmin"];

      for (const source of sources) {
        const result = createActivitySchema.safeParse({
          activity_type: "run",
          start_time: "2025-01-08T10:00:00Z",
          source,
        });
        expect(result.success, `Failed for source: ${source}`).toBe(true);
      }
    });
  });

  describe("createBulkActivitySchema", () => {
    it("accepts array of valid activities", () => {
      const valid = {
        activities: [
          { activity_type: "run", start_time: "2025-01-08T10:00:00Z" },
          { activity_type: "strength", start_time: "2025-01-09T10:00:00Z" },
        ],
      };

      const result = createBulkActivitySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects empty activities array", () => {
      const invalid = {
        activities: [],
      };

      const result = createBulkActivitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects if any activity is invalid", () => {
      const invalid = {
        activities: [
          { activity_type: "run", start_time: "2025-01-08T10:00:00Z" },
          { activity_type: "invalid", start_time: "2025-01-09T10:00:00Z" },
        ],
      };

      const result = createBulkActivitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("updateActivitySchema", () => {
    it("accepts partial update with single field", () => {
      const valid = {
        rpe: 8,
      };

      const result = updateActivitySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts empty object (no updates)", () => {
      const valid = {};

      const result = updateActivitySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("still validates field constraints", () => {
      const invalid = {
        rpe: 15, // out of range
      };

      const result = updateActivitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
