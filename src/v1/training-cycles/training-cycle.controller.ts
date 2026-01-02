import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { TrainingCycleData } from "./training-cycle.data";
import { Logger } from "@/shared/utils/logger";
import { CreateTrainingCycleInput, PhaseInput, UpdateTrainingCycleInput } from "./training-cycle.model";

export class TrainingCycleController {
  public static async getAllTrainingCycles(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;
      const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
      const years = [String(year - 1), String(year), String(year + 1)];

      const trainingCycles = await TrainingCycleData.getAllTrainingCycles(userId, years);

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
      const body = req.body as CreateTrainingCycleInput & { phases: PhaseInput[] };
      const cycle = {
        race_id: body.race_id,
        name: body.name,
        start_date: body.start_date,
        end_date: body.end_date,
        total_weeks: body.total_weeks,
        user_id: userId,
      };
      const phases = body.phases.map((el, i) => {
        return {
          phase_type: el.phase_type,
          duration_weeks: el.duration_weeks,
          order: i,
        };
      });

      const id = await TrainingCycleData.createTrainingCycleWithPhases(cycle, phases);

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
