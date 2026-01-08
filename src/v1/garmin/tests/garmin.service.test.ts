import { describe, it, expect } from "vitest";
import { GarminService } from "../garmin.service";
import { GarminActivity } from "../garmin.model";

describe("GarminService", () => {
  describe("filterActivitiesByDate", () => {
    const activities: GarminActivity[] = [
      {
        activityId: 1,
        activityType: { typeKey: "running" },
        startTimeLocal: "2025-01-10 10:00:00",
        startTimeGMT: "2025-01-10 09:00:00",
        duration: 3600,
        distance: 10000,
      },
      {
        activityId: 2,
        activityType: { typeKey: "running" },
        startTimeLocal: "2025-01-08 10:00:00",
        startTimeGMT: "2025-01-08 09:00:00",
        duration: 3600,
        distance: 10000,
      },
      {
        activityId: 3,
        activityType: { typeKey: "running" },
        startTimeLocal: "2025-01-05 10:00:00",
        startTimeGMT: "2025-01-05 09:00:00",
        duration: 3600,
        distance: 10000,
      },
    ];

    it("filters activities after the given date", () => {
      const afterDate = new Date("2025-01-07T00:00:00Z");
      const result = GarminService.filterActivitiesByDate(activities, afterDate);

      expect(result).toHaveLength(2);
      expect(result.map((a) => a.activityId)).toEqual([1, 2]);
    });

    it("returns empty array when all activities are before date", () => {
      const afterDate = new Date("2025-01-15T00:00:00Z");
      const result = GarminService.filterActivitiesByDate(activities, afterDate);

      expect(result).toHaveLength(0);
    });

    it("returns all activities when date is before all activities", () => {
      const afterDate = new Date("2025-01-01T00:00:00Z");
      const result = GarminService.filterActivitiesByDate(activities, afterDate);

      expect(result).toHaveLength(3);
    });

    it("handles empty activities array", () => {
      const afterDate = new Date("2025-01-07T00:00:00Z");
      const result = GarminService.filterActivitiesByDate([], afterDate);

      expect(result).toHaveLength(0);
    });

    it("excludes activities exactly on the cutoff date", () => {
      const afterDate = new Date("2025-01-08T09:00:00Z");
      const result = GarminService.filterActivitiesByDate(activities, afterDate);

      expect(result).toHaveLength(1);
      expect(result[0].activityId).toBe(1);
    });
  });
});
