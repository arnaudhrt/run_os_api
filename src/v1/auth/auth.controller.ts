import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { AuthData } from "./auth.data";
import { Logger } from "@/shared/utils/logger";
import { CreateUserModel } from "./auth.model";

export class AuthController {
  public static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        throw new ApiError(new Date().toISOString(), "User uid not found", HttpStatusCode.UNAUTHORIZED);
      }
      const user = await AuthData.getUserById(uid);

      if (!user) {
        throw new ApiError(new Date().toISOString(), "User data not found", HttpStatusCode.INTERNAL_SERVER_ERROR);
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: { ...user },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "AuthController", method: "getUser" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async registerUser(req: Request, res: Response): Promise<void> {
    const userData = req.body as CreateUserModel;
    try {
      await AuthData.registerUser(userData);
      Logger.info("User registration successful");
      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "AuthController", method: "registerUser" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }
}
