import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { handleValidationError } from "@/shared/utils/validationHandler";
import { activityTypes, allWorkoutTypes, dataSources } from "@/shared/models/types";

const createActivitySchema = z.object({
  source: z.enum(dataSources).optional(),
  garmin_activity_id: z.string().optional(),
  strava_activity_id: z.number().optional(),
  activity_type: z.enum(activityTypes),
  workout_type: z.enum(allWorkoutTypes).nullable().optional(),
  start_time: z.string().min(1),
  distance_meters: z.number().nonnegative().optional(),
  duration_seconds: z.number().nonnegative().optional(),
  elevation_gain_meters: z.number().nonnegative().optional(),
  avg_heart_rate: z.number().positive().optional(),
  max_heart_rate: z.number().positive().optional(),
  avg_temperature_celsius: z.number().optional(),
  is_pr: z.boolean().optional(),
  has_pain: z.string().optional(),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  shoes_id: z.string().uuid().optional(),
});

const createBulkActivitySchema = z.object({
  activities: z.array(createActivitySchema).min(1),
});

const updateActivitySchema = createActivitySchema.partial();

export const verifyCreateActivityFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createActivitySchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "create activity");
  }
};

export const verifyCreateBulkActivityFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createBulkActivitySchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "create bulk activities");
  }
};

export const verifyUpdateActivityFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    updateActivitySchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "update activity");
  }
};
