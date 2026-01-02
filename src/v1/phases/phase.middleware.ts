import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { handleValidationError } from "@/shared/utils/validationHandler";

const createPhaseSchema = z.object({
  cycle_id: z.string().uuid(),
  phase_type: z.enum(["base", "build", "peak", "taper", "recovery", "off"]),
  order: z.number().int().positive(),
  duration_weeks: z.number().int().positive(),
});

const updatePhaseSchema = z.object({
  phase_type: z.enum(["base", "build", "peak", "taper", "recovery", "off"]).optional(),
  order: z.number().int().positive().optional(),
  duration_weeks: z.number().int().positive().optional(),
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
