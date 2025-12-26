import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { GarminData } from "./garmin.data";
import { Logger } from "@/shared/utils/logger";
import { ActivityData } from "@/v1/activities/activity.data";
import type { GarminConnectRequest } from "./garmin.model";
import { convertGarminActivities } from "./garmin.utils";

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

      // Try to login to Garmin Connect
      const client = await GarminData.createGarminClient(email, password);

      // Export tokens for storage
      const tokens = GarminData.exportTokens(client);

      // Encrypt password before storing
      const encryptedPassword = GarminData.encryptPassword(password);

      // Store account in database
      await GarminData.createGarminAccount({
        user_id: userId,
        garmin_email: email,
        garmin_password_encrypted: encryptedPassword,
        oauth1_token: tokens?.oauth1,
        oauth2_token: tokens?.oauth2,
      });

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
      //const { from_date } = req.query as { from_date?: string };

      const account = await GarminData.getGarminAccountByUserId(userId);
      if (!account) {
        throw new ApiError(new Date().toISOString(), "Garmin account not connected", HttpStatusCode.NOT_FOUND);
      }

      // Create authenticated client
      const client = await GarminData.createClientFromAccount(account);

      // Determine the "after" date
      const from_date = "2025-01-01";
      let afterDate: Date | undefined;
      if (from_date) {
        afterDate = new Date(from_date);
      } else if (account.last_sync_at) {
        afterDate = new Date(account.last_sync_at);
      }

      // Fetch activities
      const garminActivities = await GarminData.fetchAllActivities(client, afterDate);
      const convertedActivities = convertGarminActivities(garminActivities, userId);

      // Save activities to database
      let savedCount = 0;
      if (convertedActivities.length > 0) {
        const ids = await ActivityData.createBulk(convertedActivities);
        savedCount = ids.length;
      }

      // Update tokens and last_sync_at
      const newTokens = GarminData.exportTokens(client);
      await GarminData.updateGarminAccount(userId, {
        oauth1_token: newTokens?.oauth1,
        oauth2_token: newTokens?.oauth2,
        last_sync_at: new Date(),
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          synced: savedCount,
          fetched: garminActivities.length,
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
