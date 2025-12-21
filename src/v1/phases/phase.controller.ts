import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { PhaseData } from "./phase.data";
import { Logger } from "@/shared/utils/logger";
import { CreatePhaseModel, UpdatePhaseModel } from "./phase.model";

export class PhaseController {
  public static async getAllPhases(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;

      const phases = await PhaseData.getAllPhases(userId);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: phases,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "PhaseController", method: "getAllPhases" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async getPhaseById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const userId = req.dbUser!.id;

      const phase = await PhaseData.getPhaseById(id, userId);
      if (!phase) {
        throw new ApiError(new Date().toISOString(), "Phase not found", HttpStatusCode.NOT_FOUND);
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: phase,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "PhaseController", method: "getPhaseById" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async createPhase(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;
      const body = req.body as Omit<CreatePhaseModel, "user_id">;

      const id = await PhaseData.createPhase({ ...body, user_id: userId });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        data: { id },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "PhaseController", method: "createPhase" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async updatePhase(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const userId = req.dbUser!.id;
      const body = req.body as UpdatePhaseModel;

      const phase = await PhaseData.getPhaseById(id, userId);
      if (!phase) {
        throw new ApiError(new Date().toISOString(), "Phase not found", HttpStatusCode.NOT_FOUND);
      }

      await PhaseData.updatePhase(id, body);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "PhaseController", method: "updatePhase" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async deletePhase(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const userId = req.dbUser!.id;

      const phase = await PhaseData.getPhaseById(id, userId);
      if (!phase) {
        throw new ApiError(new Date().toISOString(), "Phase not found", HttpStatusCode.NOT_FOUND);
      }

      await PhaseData.deletePhase(id);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "PhaseController", method: "deletePhase" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }
}
