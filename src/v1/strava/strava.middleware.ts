import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { handleValidationError } from "@/shared/utils/validationHandler";
import { env } from "@/shared/config/global.config";

const callbackQuerySchema = z.object({
  code: z.string().min(1),
  scope: z.string().optional(),
  state: z.string().optional(),
});

export const verifyCallbackQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = req.query;

  // User denied access
  if (error) {
    res.redirect(`${env.FRONTEND_APP_URL}/settings?strava=denied`);
    return;
  }

  try {
    callbackQuerySchema.parse(req.query);
    next();
  } catch (error) {
    handleValidationError(error, res, "strava callback");
  }
};
