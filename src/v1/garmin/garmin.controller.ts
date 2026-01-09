import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { GarminData } from "./garmin.data";
import { GarminService } from "./garmin.service";
import { Logger } from "@/shared/utils/logger";
import type { GarminConnectRequest } from "./garmin.model";

export class GarminController {
  /**
   * Connect Garmin account with email/password
   */
  public static async connect(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;
      const { email, password } = req.body as GarminConnectRequest;

      if (!email || !password) {
        throw new ApiError(new Date().toISOString(), "Email and password are required", HttpStatusCode.BAD_REQUEST);
      }

      await GarminService.connectAccount(userId, email, password);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Garmin account connected successfully",
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "GarminController", method: "connect" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  /**
   * Disconnect Garmin account
   */
  public static async disconnect(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;

      await GarminData.deleteGarminAccount(userId);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "GarminController", method: "disconnect" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  /**
   * Get Garmin connection status
   */
  public static async getConnectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;

      const account = await GarminData.getGarminAccountByUserId(userId);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          connected: !!account,
          email: account?.garmin_email || null,
          last_sync_at: account?.last_sync_at || null,
        },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "GarminController", method: "getConnectionStatus" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  /**
   * Sync activities from Garmin
   */
  public static async syncActivities(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;
      const { start_date, end_date } = req.query as { start_date?: string; end_date?: string };

      const account = await GarminData.getGarminAccountByUserId(userId);
      if (!account) {
        throw new ApiError(new Date().toISOString(), "Garmin account not connected", HttpStatusCode.NOT_FOUND);
      }

      // Parse date parameters if provided
      const startDate = start_date ? new Date(start_date) : undefined;
      const endDate = end_date ? new Date(end_date) : undefined;

      // Validate dates if provided
      if (startDate && isNaN(startDate.getTime())) {
        throw new ApiError(new Date().toISOString(), "Invalid start_date format. Use ISO 8601 format.", HttpStatusCode.BAD_REQUEST);
      }
      if (endDate && isNaN(endDate.getTime())) {
        throw new ApiError(new Date().toISOString(), "Invalid end_date format. Use ISO 8601 format.", HttpStatusCode.BAD_REQUEST);
      }
      if (startDate && endDate && startDate > endDate) {
        throw new ApiError(new Date().toISOString(), "start_date must be before end_date", HttpStatusCode.BAD_REQUEST);
      }

      const result = await GarminService.syncActivities(userId, account, { startDate, endDate });

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          synced: result.saved,
          fetched: result.fetched,
        },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "GarminController", method: "syncActivities" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  /**
   * Get Garmin account info
   */
  public static async getGarminUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;

      const account = await GarminData.getGarminAccountByUserId(userId);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: account
          ? {
              id: account.id,
              email: account.garmin_email,
              last_sync_at: account.last_sync_at,
              created_at: account.created_at,
            }
          : null,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "GarminController", method: "getGarminUser" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }
}
