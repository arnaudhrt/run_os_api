import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { ActivityData } from "./activity.data";
import { Logger } from "@/shared/utils/logger";
import { CreateActivityModel, ActivitySearchParams } from "./activity.model";
import { structureActivitiesLog } from "./activity.utils";

export class ActivityController {
  public static async getAllUserActivities(req: Request, res: Response): Promise<void> {
    try {
      const [activities, dateRange] = await Promise.all([ActivityData.getAllByUserId(req.dbUser!.id), ActivityData.getDateRange(req.dbUser!.id)]);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          activities,
          min_date: dateRange.minDate,
          max_date: dateRange.maxDate,
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
}
