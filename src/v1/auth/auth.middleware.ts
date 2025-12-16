import { HttpStatusCode } from "@/shared/models/errors";
import { ApiError, ErrorHandler } from "@/shared/utils/errorHandler";
import { Logger } from "@/shared/utils/logger";
import { handleValidationError } from "@/shared/utils/validationHandler";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as admin from "firebase-admin";
import { AuthData } from "./auth.data";

const registerSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().min(1),
  firebase_uid: z.string().min(1),
});

export const verifyRegisterFields = (req: Request, res: Response, next: NextFunction): void => {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(error, res, "register");
  }
};

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from "Bearer <token>"
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    // Verify token type and length
    if (!token || typeof token !== "string" || !token.trim() || token.length < 100) {
      const apiError = new ApiError(new Date().toISOString(), "Missing or invalid token");
      Logger.error(apiError, { class: "AuthMiddleware", method: "verifyToken" });
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Missing or invalid token",
      });
      return;
    }

    // Decode token and extract user info
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Add user context to request for authorization
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
    };

    next();
  } catch (error) {
    const apiError = ErrorHandler.processError(error);
    Logger.error(apiError, { class: "AuthMiddleware", method: "verifyToken" });
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "Unable to verify token, please control your request",
    });
  }
};

export const requireUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      const apiError = new ApiError(new Date().toISOString(), "User uid not found", HttpStatusCode.UNAUTHORIZED);
      Logger.error(apiError, { class: "AuthMiddleware", method: "requireUser" });
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const user = await AuthData.getUserById(uid);
    if (!user) {
      const apiError = new ApiError(new Date().toISOString(), "User not found", HttpStatusCode.NOT_FOUND);
      Logger.error(apiError, { class: "AuthMiddleware", method: "requireUser" });
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    req.dbUser = user;
    next();
  } catch (error) {
    const apiError = ErrorHandler.processError(error);
    Logger.error(apiError, { class: "AuthMiddleware", method: "requireUser" });
    res.status(apiError.statusCode).json({
      success: false,
      message: apiError.message,
    });
  }
};
