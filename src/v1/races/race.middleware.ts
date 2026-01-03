import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { handleValidationError } from "@/shared/utils/validationHandler";

const createRaceSchema = z.object({
  name: z.string().min(1),
  race_date: z.string().min(1),
  distance_meters: z.number().positive().optional(),
  elevation_gain_meters: z.number().nonnegative().optional(),
  target_time_seconds: z.number().positive().optional(),
  location: z.string().optional(),
  race_type: z.enum(["run", "half_marathon", "marathon", "ultra_marathon", "triathlon", "trail", "ultra_trail"]),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  notes: z.string().optional(),
});

const updateRaceSchema = z.object({
  name: z.string().min(1).optional(),
  race_date: z.string().min(1).optional(),
  distance_meters: z.number().positive().optional(),
  elevation_gain_meters: z.number().nonnegative().optional(),
  target_time_seconds: z.number().positive().optional(),
  location: z.string().optional(),
  race_type: z.enum(["run", "half_marathon", "marathon", "ultra_marathon", "triathlon", "trail", "ultra_trail"]).optional(),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  notes: z.string().optional(),
  result_time_seconds: z.number().positive().optional(),
  result_place_overall: z.number().positive().optional(),
  result_place_gender: z.number().positive().optional(),
  result_place_category: z.number().positive().optional(),
  category_name: z.string().optional(),
  is_completed: z.boolean().optional(),
});

export const verifyCreateRaceFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createRaceSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "create race");
  }
};

export const verifyUpdateRaceFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    updateRaceSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "update race");
  }
};
