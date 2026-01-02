import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { TrainingCycleData } from "./training-cycle.data";
import { TrainingCycleService } from "./training-cycle.service";
import { Logger } from "@/shared/utils/logger";
import { CreateTrainingCycleInput, UpdateTrainingCycleInput } from "./training-cycle.model";

export class TrainingCycleController {
  public static async getAllTrainingCycles(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;

      const trainingCycles = await TrainingCycleData.getAllTrainingCycles(userId);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: trainingCycles,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "TrainingCycleController", method: "getAllTrainingCycles" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async getTrainingCycleById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const userId = req.dbUser!.id;

      const trainingCycle = await TrainingCycleData.getTrainingCycleById(id, userId);
      if (!trainingCycle) {
        throw new ApiError(new Date().toISOString(), "Training cycle not found", HttpStatusCode.NOT_FOUND);
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: trainingCycle,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "TrainingCycleController", method: "getTrainingCycleById" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async createTrainingCycle(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;
      const body = req.body as Omit<CreateTrainingCycleInput, "user_id">;

      const id = await TrainingCycleService.createTrainingCycle({ ...body, user_id: userId });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        data: { id },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "TrainingCycleController", method: "createTrainingCycle" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async updateTrainingCycle(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const userId = req.dbUser!.id;
      const body = req.body as UpdateTrainingCycleInput;

      const trainingCycle = await TrainingCycleData.getTrainingCycleById(id, userId);
      if (!trainingCycle) {
        throw new ApiError(new Date().toISOString(), "Training cycle not found", HttpStatusCode.NOT_FOUND);
      }

      await TrainingCycleData.updateTrainingCycle(id, body);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "TrainingCycleController", method: "updateTrainingCycle" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async deleteTrainingCycle(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const userId = req.dbUser!.id;

      const trainingCycle = await TrainingCycleData.getTrainingCycleById(id, userId);
      if (!trainingCycle) {
        throw new ApiError(new Date().toISOString(), "Training cycle not found", HttpStatusCode.NOT_FOUND);
      }

      await TrainingCycleData.deleteTrainingCycle(id);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "TrainingCycleController", method: "deleteTrainingCycle" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }
}
