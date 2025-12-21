import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { RaceData } from "./race.data";
import { Logger } from "@/shared/utils/logger";
import { CreateRaceModel, UpdateRaceModel } from "./race.model";

export class RaceController {
  public static async getAllRaces(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;

      const races = await RaceData.getAllRaces(userId);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: races,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "RaceController", method: "getAllRaces" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async getRaceById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const userId = req.dbUser!.id;

      const race = await RaceData.getRaceById(id, userId);
      if (!race) {
        throw new ApiError(new Date().toISOString(), "Race not found", HttpStatusCode.NOT_FOUND);
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: race,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "RaceController", method: "getRaceById" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async createRace(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.dbUser!.id;
      const body = req.body as Omit<CreateRaceModel, "user_id">;

      const id = await RaceData.createRace({ ...body, user_id: userId });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        data: { id },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "RaceController", method: "createRace" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async updateRace(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const userId = req.dbUser!.id;
      const body = req.body as UpdateRaceModel;

      const race = await RaceData.getRaceById(id, userId);
      if (!race) {
        throw new ApiError(new Date().toISOString(), "Race not found", HttpStatusCode.NOT_FOUND);
      }

      await RaceData.updateRace(id, body);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "RaceController", method: "updateRace" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async deleteRace(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const userId = req.dbUser!.id;

      const race = await RaceData.getRaceById(id, userId);
      if (!race) {
        throw new ApiError(new Date().toISOString(), "Race not found", HttpStatusCode.NOT_FOUND);
      }

      await RaceData.deleteRace(id);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "RaceController", method: "deleteRace" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }
}
