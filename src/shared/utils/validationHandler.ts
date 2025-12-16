import { Response } from "express";
import { z } from "zod";
import { HttpStatusCode } from "@/shared/models/errors";
import { ApiError } from "@/shared/utils/errorHandler";
import { Logger } from "@/shared/utils/logger";

export const handleValidationError = (error: unknown, res: Response, context: string): void => {
  if (error instanceof z.ZodError) {
    const apiError = new ApiError(new Date().toISOString(), `Validation error on ${context}`);
    Logger.error(apiError, { fields: error.errors });
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "Some fields are missing or invalid",
      data: error.errors,
    });
    return;
  }

  const apiError = new ApiError(new Date().toISOString(), "Unable to verify fields");
  Logger.error(apiError);
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Unable to verify fields, please control your request",
  });
};
