import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { handleValidationError } from "@/shared/utils/validationHandler";

const phaseInputSchema = z.object({
  phase_type: z.enum(["base", "build", "peak", "taper", "recovery", "off"]),
  duration_weeks: z.number().int().positive(),
});

const createTrainingCycleSchema = z.object({
  race_id: z.string().uuid().optional(),
  name: z.string().min(1),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  total_weeks: z.number().int().positive(),
  phases: z.array(phaseInputSchema).min(1),
});

const updateTrainingCycleSchema = z.object({
  name: z.string().min(1),
});

export const verifyCreateTrainingCycleFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createTrainingCycleSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "create training cycle");
  }
};

export const verifyUpdateTrainingCycleFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    updateTrainingCycleSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "update training cycle");
  }
};
