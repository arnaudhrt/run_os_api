import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { handleValidationError } from "@/shared/utils/validationHandler";

const activityTypes = ["run", "trail", "treadmill", "walk", "hike", "bike", "swim", "strength", "cross_training"] as const;
const workoutTypes = ["easy_run", "hills", "long_run", "tempo", "threshold", "intervals", "race", "other"] as const;

const createActivitySchema = z.object({
  activity_type: z.enum(activityTypes),
  workout_type: z.enum(workoutTypes),
  start_time: z.string().min(1),
  distance_meters: z.number().nonnegative().optional(),
  duration_seconds: z.number().nonnegative().optional(),
  elevation_gain_meters: z.number().nonnegative().optional(),
  elevation_loss_meters: z.number().nonnegative().optional(),
  avg_heart_rate: z.number().positive().optional(),
  max_heart_rate: z.number().positive().optional(),
  avg_pace_min_per_km: z.number().positive().optional(),
  best_pace_min_per_km: z.number().positive().optional(),
  avg_cadence: z.number().positive().optional(),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  avg_temperature_celsius: z.number().optional(),
});

const createBulkActivitySchema = z.object({
  activities: z.array(createActivitySchema).min(1),
});

const updateActivitySchema = z.object({
  activity_type: z.enum(activityTypes).optional(),
  workout_type: z.enum(workoutTypes).optional(),
  start_time: z.string().min(1).optional(),
  distance_meters: z.number().nonnegative().optional(),
  duration_seconds: z.number().nonnegative().optional(),
  elevation_gain_meters: z.number().nonnegative().optional(),
  elevation_loss_meters: z.number().nonnegative().optional(),
  avg_heart_rate: z.number().positive().optional(),
  max_heart_rate: z.number().positive().optional(),
  avg_pace_min_per_km: z.number().positive().optional(),
  best_pace_min_per_km: z.number().positive().optional(),
  avg_cadence: z.number().positive().optional(),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  avg_temperature_celsius: z.number().optional(),
});

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
