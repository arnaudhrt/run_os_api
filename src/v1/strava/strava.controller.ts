import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { StravaData } from "./strava.data";
import { Logger } from "@/shared/utils/logger";
import { env } from "@/shared/config/global.config";
import { StravaCallbackQuery } from "./strava.model";
import { requireUser, verifyToken } from "../auth/auth.middleware";

export class StravaController {
  public static async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, scope, state } = req.query as StravaCallbackQuery;
      req.headers.authorization = `Bearer ${state}`;
      verifyToken(req, res, () => {
        return true;
      });
      requireUser(req, res, () => {
        return true;
      });
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

      const account = await StravaData.getStravaAccountByUserId(userId);
      if (!account) {
        throw new ApiError(new Date().toISOString(), "Strava account not connected", HttpStatusCode.NOT_FOUND);
      }

      const accessToken = await StravaData.getValidAccessToken(account);

      // Fetch activities since last sync
      const after = account.last_sync_at ? Math.floor(new Date(account.last_sync_at).getTime() / 1000) : undefined;

      const activities = await StravaData.fetchAllActivities(accessToken, after);

      // Update last sync timestamp
      await StravaData.updateStravaAccount(userId, {
        last_sync_at: new Date(),
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          activities_count: activities.length,
          activities: activities,
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
}
