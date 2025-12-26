import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { PlannedWorkoutData } from "./planned-workout.data";
import { Logger } from "@/shared/utils/logger";
import { CreatePlannedWorkoutModel, PlannedWorkoutDateRangeParams } from "./planned-workout.model";

export class PlannedWorkoutController {
  public static async getByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const params: PlannedWorkoutDateRangeParams = {
        start: req.query.start as string,
        end: req.query.end as string,
      };

      const plannedWorkouts = await PlannedWorkoutData.getByDateRange(req.dbUser!.id, params);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: plannedWorkouts,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "PlannedWorkoutController", method: "getByDateRange" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as CreatePlannedWorkoutModel;
      const id = await PlannedWorkoutData.create({ ...body, user_id: req.dbUser!.id });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        data: { id },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "PlannedWorkoutController", method: "create" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      const plannedWorkout = await PlannedWorkoutData.getById(id);
      if (!plannedWorkout) {
        throw new ApiError(new Date().toISOString(), "Planned workout not found", HttpStatusCode.NOT_FOUND);
      }

      if (plannedWorkout.user_id !== req.dbUser!.id) {
        throw new ApiError(new Date().toISOString(), "Unauthorized", HttpStatusCode.FORBIDDEN);
      }

      await PlannedWorkoutData.update(id, req.body);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "PlannedWorkoutController", method: "update" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      const plannedWorkout = await PlannedWorkoutData.getById(id);
      if (!plannedWorkout) {
        throw new ApiError(new Date().toISOString(), "Planned workout not found", HttpStatusCode.NOT_FOUND);
      }

      if (plannedWorkout.user_id !== req.dbUser!.id) {
        throw new ApiError(new Date().toISOString(), "Unauthorized", HttpStatusCode.FORBIDDEN);
      }

      await PlannedWorkoutData.delete(id);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "PlannedWorkoutController", method: "delete" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async linkActivity(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const { activity_id } = req.body as { activity_id: string };

      const plannedWorkout = await PlannedWorkoutData.getById(id);
      if (!plannedWorkout) {
        throw new ApiError(new Date().toISOString(), "Planned workout not found", HttpStatusCode.NOT_FOUND);
      }

      if (plannedWorkout.user_id !== req.dbUser!.id) {
        throw new ApiError(new Date().toISOString(), "Unauthorized", HttpStatusCode.FORBIDDEN);
      }

      await PlannedWorkoutData.linkActivity(id, activity_id);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "PlannedWorkoutController", method: "linkActivity" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }
}
