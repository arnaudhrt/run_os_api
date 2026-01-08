import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { handleValidationError } from "@/shared/utils/validationHandler";
import { timeSlots, activityTypes, allWorkoutTypes } from "@/shared/models/types";

const createPlannedWorkoutSchema = z.object({
  planned_date: z.string().min(1),
  time_slot: z.enum(timeSlots),
  activity_type: z.enum(activityTypes),
  workout_type: z.enum(allWorkoutTypes),
  target_distance_meters: z.number().nonnegative().optional(),
  target_duration_seconds: z.number().nonnegative().optional(),
  description: z.string().optional(),
});

const updatePlannedWorkoutSchema = z.object({
  planned_date: z.string().min(1).optional(),
  time_slot: z.enum(timeSlots).optional(),
  activity_type: z.enum(activityTypes).optional(),
  workout_type: z.enum(allWorkoutTypes).optional(),
  target_distance_meters: z.number().nonnegative().nullable().optional(),
  target_duration_seconds: z.number().nonnegative().nullable().optional(),
  description: z.string().nullable().optional(),
});

const linkActivitySchema = z.object({
  activity_id: z.string().uuid(),
});

const dateRangeQuerySchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
});

export const verifyCreatePlannedWorkoutFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createPlannedWorkoutSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "create planned workout");
  }
};

export const verifyUpdatePlannedWorkoutFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    updatePlannedWorkoutSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "update planned workout");
  }
};

export const verifyLinkActivityFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    linkActivitySchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "link activity");
  }
};

export const verifyDateRangeQuery = (req: Request, res: Response, next: NextFunction): void => {
  try {
    dateRangeQuerySchema.parse(req.query);
    next();
  } catch (error) {
    handleValidationError(error, res, "date range query");
  }
};
