import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { handleValidationError } from "@/shared/utils/validationHandler";

const createPhaseSchema = z.object({
  race_id: z.string().uuid().optional(),
  phase_type: z.enum(["base", "build", "peak", "taper", "recovery", "off"]),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  description: z.string().optional(),
  weekly_volume_target_km: z.number().nonnegative().optional(),
  weekly_elevation_target_m: z.number().nonnegative().optional(),
});

const updatePhaseSchema = z.object({
  race_id: z.string().uuid().nullable().optional(),
  phase_type: z.enum(["base", "build", "peak", "taper", "recovery", "off"]).optional(),
  start_date: z.string().min(1).optional(),
  end_date: z.string().min(1).optional(),
  description: z.string().optional(),
  weekly_volume_target_km: z.number().nonnegative().optional(),
  weekly_elevation_target_m: z.number().nonnegative().optional(),
});

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
