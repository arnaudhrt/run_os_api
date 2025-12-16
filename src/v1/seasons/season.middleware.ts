import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { handleValidationError } from "@/shared/utils/validationHandler";

// Season schemas
const createSeasonSchema = z.object({
  name: z.string().min(1),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
});

const updateSeasonSchema = z.object({
  name: z.string().min(1).optional(),
  start_date: z.string().min(1).optional(),
  end_date: z.string().min(1).optional(),
});

// Race schemas
const createRaceSchema = z.object({
  season_id: z.string().uuid(),
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
  result_place: z.string().optional(),
  is_completed: z.boolean().optional(),
});

// Phase schemas
const createPhaseSchema = z.object({
  race_id: z.string().uuid(),
  phase_type: z.enum(["base", "build", "peak", "taper", "recovery", "off"]),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  description: z.string().optional(),
  weekly_volume_target_km: z.number().nonnegative().optional(),
  weekly_elevation_target_m: z.number().nonnegative().optional(),
});

const updatePhaseSchema = z.object({
  phase_type: z.enum(["base", "build", "peak", "taper", "recovery", "off"]).optional(),
  start_date: z.string().min(1).optional(),
  end_date: z.string().min(1).optional(),
  description: z.string().optional(),
  weekly_volume_target_km: z.number().nonnegative().optional(),
  weekly_elevation_target_m: z.number().nonnegative().optional(),
});

// Season middlewares
export const verifyCreateSeasonFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createSeasonSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "create season");
  }
};

export const verifyUpdateSeasonFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    updateSeasonSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "update season");
  }
};

// Race middlewares
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

// Phase middlewares
export const verifyCreatePhaseFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createPhaseSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "create phase");
  }
};

export const verifyUpdatePhaseFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    updatePhaseSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "update phase");
  }
};
