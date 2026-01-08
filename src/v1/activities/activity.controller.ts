import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { ActivityData } from "./activity.data";
import { ActivityService } from "./activity.service";
import { Logger } from "@/shared/utils/logger";
import { CreateActivityModel, ActivitySearchParams } from "./activity.model";

const TOTAL_WEEKS = 104;

export class ActivityController {
  public static async getAllUserActivities(req: Request, res: Response): Promise<void> {
    try {
      const [activities, dateRange] = await Promise.all([ActivityData.getAllByUserId(req.dbUser!.id), ActivityData.getDateRange(req.dbUser!.id)]);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          activities, // ActicityModel[]
          min_date: dateRange.minDate, // earliest date activity found in the database (ISO string T)
          max_date: dateRange.maxDate, // latest date activity found in the database (ISO string T)
        },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "ActivityController", method: "getAllUserActivities" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async getUserActivitiesBySearch(req: Request, res: Response): Promise<void> {
    try {
      const params: ActivitySearchParams = {
        activity_type: req.query.activity_type as ActivitySearchParams["activity_type"],
        workout_type: req.query.workout_type as ActivitySearchParams["workout_type"],
      };

      const activities = await ActivityData.search(req.dbUser!.id, params);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: activities,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "ActivityController", method: "getUserActivitiesBySearch" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async createActivity(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as CreateActivityModel;
      const id = await ActivityData.create({ ...body, user_id: req.dbUser!.id });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        data: { id },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "ActivityController", method: "createActivity" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async createBulkActivity(req: Request, res: Response): Promise<void> {
    try {
      const { activities } = req.body as { activities: CreateActivityModel[] };
      const activitiesWithUser = activities.map((activity) => ({
        ...activity,
        user_id: req.dbUser!.id,
      }));

      const ids = await ActivityData.createBulk(activitiesWithUser);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        data: { ids },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "ActivityController", method: "createBulkActivity" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async updateActivity(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      const activity = await ActivityData.getById(id);
      if (!activity) {
        throw new ApiError(new Date().toISOString(), "Activity not found", HttpStatusCode.NOT_FOUND);
      }

      await ActivityData.update(id, req.body);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "ActivityController", method: "updateActivity" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async deleteActivity(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      const activity = await ActivityData.getById(id);
      if (!activity) {
        throw new ApiError(new Date().toISOString(), "Activity not found", HttpStatusCode.NOT_FOUND);
      }

      await ActivityData.delete(id);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "ActivityController", method: "deleteActivity" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async getWeeklyStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;
      const year = parseInt(req.params.year, 10);

      if (isNaN(year)) {
        throw new ApiError(new Date().toISOString(), "Invalid year parameter", HttpStatusCode.BAD_REQUEST);
      }

      // Start from July 1st of the previous year
      const startDate = new Date(year - 1, 6, 1); // Month is 0-indexed, so 6 = July

      const weeklyStats = await ActivityService.getWeeklyStats(userId, startDate, TOTAL_WEEKS);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: weeklyStats,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "ActivityController", method: "getWeeklyStats" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }
}
