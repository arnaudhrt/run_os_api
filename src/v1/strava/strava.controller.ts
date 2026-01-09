import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { StravaData } from "./strava.data";
import { Logger } from "@/shared/utils/logger";
import { env } from "@/shared/config/global.config";
import { StravaCallbackQuery } from "./strava.model";
import { requireUser, verifyToken } from "../auth/auth.middleware";
import { convertStravaActivities } from "./strava.utils";
import { ActivityData } from "@/v1/activities/activity.data";

export class StravaController {
  public static async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, scope, state } = req.query as StravaCallbackQuery;
      req.headers.authorization = `Bearer ${state}`;

      // Await the middleware and check if they completed successfully
      let authFailed = false;
      await verifyToken(req, res, () => {});
      if (!req.user) {
        authFailed = true;
      }
      if (!authFailed) {
        await requireUser(req, res, () => {});
        if (!req.dbUser) {
          authFailed = true;
        }
      }

      if (authFailed) {
        // Response already sent by middleware
        return;
      }

      const userId = req.dbUser!.id;

      const tokens = await StravaData.exchangeCodeForTokens(code!);

      await StravaData.createStravaAccount({
        user_id: userId,
        strava_athlete_id: tokens.athlete.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(tokens.expires_at * 1000),
        scope: scope,
      });

      res.redirect(`${env.FRONTEND_APP_URL}/app/profile?strava=connected`);
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "StravaController", method: "handleCallback" });
      res.redirect(`${env.FRONTEND_APP_URL}/app/profile?strava=error`);
    }
  }

  public static async disconnect(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;

      const account = await StravaData.getStravaAccountByUserId(userId);
      if (account) {
        try {
          await StravaData.revokeAccess(account.access_token);
        } catch {
          // Ignore revocation errors - account might already be disconnected on Strava side
        }
        await StravaData.deleteStravaAccount(userId);
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "StravaController", method: "disconnect" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async getConnectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;

      const account = await StravaData.getStravaAccountByUserId(userId);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          connected: !!account,
          strava_athlete_id: account?.strava_athlete_id || null,
          last_sync_at: account?.last_sync_at || null,
        },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "StravaController", method: "getConnectionStatus" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async syncActivities(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;
      const { start_date, end_date } = req.query as { start_date?: string; end_date?: string };

      const account = await StravaData.getStravaAccountByUserId(userId);
      if (!account) {
        throw new ApiError(new Date().toISOString(), "Strava account not connected", HttpStatusCode.NOT_FOUND);
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

      const accessToken = await StravaData.getValidAccessToken(account);

      // Determine the "after" and "before" timestamps for fetching activities
      // If date range provided, use it; otherwise fall back to last_sync_at
      let after: number | undefined;
      let before: number | undefined;

      if (startDate || endDate) {
        after = startDate ? Math.floor(startDate.getTime() / 1000) : undefined;
        before = endDate ? Math.floor(endDate.getTime() / 1000) : undefined;
      } else if (account.last_sync_at) {
        after = Math.floor(new Date(account.last_sync_at).getTime() / 1000);
      }

      // Fetch activities from Strava
      const stravaActivities = await StravaData.fetchAllActivities(accessToken, after, before);

      // Get existing activity timestamps for duplicate detection
      const dbActivities = await ActivityData.getAllByUserId(userId);
      const existingTimestamps = new Set(dbActivities.map((a) => a.start_time));

      // Filter out duplicates (activities with matching start_date)
      const newActivities = stravaActivities.filter(
        (sa) => !existingTimestamps.has(sa.start_date)
      );

      // Convert and save new activities
      const convertedActivities = convertStravaActivities(newActivities, userId);
      let savedCount = 0;
      if (convertedActivities.length > 0) {
        const ids = await ActivityData.createBulk(convertedActivities);
        savedCount = ids.length;
      }

      // Update last_sync_at
      await StravaData.updateStravaAccount(userId, {
        last_sync_at: new Date(),
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          fetched: stravaActivities.length,
          duplicates_skipped: stravaActivities.length - newActivities.length,
          saved: savedCount,
        },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "StravaController", method: "syncActivities" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async getAuthUrl(_req: Request, res: Response): Promise<void> {
    try {
      const redirectUri = `${env.API_URL}/api/v1/strava/callback`;
      const scope = "read,activity:read_all";

      const authUrl =
        `https://www.strava.com/oauth/authorize?` +
        `client_id=${env.STRAVA_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${scope}`;

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          url: authUrl,
        },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "StravaController", method: "getAuthUrl" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async getStravaUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;

      const account = await StravaData.getStravaAccountByUserId(userId);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: account,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "StravaController", method: "getStravaUser" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }
}
