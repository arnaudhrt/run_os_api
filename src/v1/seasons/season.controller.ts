import { Request, Response } from "express";
import { ErrorHandler, ApiError } from "@/shared/utils/errorHandler";
import { HttpStatusCode } from "@/shared/models/errors";
import { SeasonData } from "./season.data";
import { Logger } from "@/shared/utils/logger";
import { CreateSeasonModel, CreateRaceModel, CreatePhaseModel, UpdateSeasonModel, UpdateRaceModel, UpdatePhaseModel } from "./season.model";

export class SeasonController {
  // Season controllers
  public static async getUserActiveSeason(req: Request, res: Response): Promise<void> {
    try {
      const season = await SeasonData.getActiveSeasonWithRacesByUserId(req.dbUser!.id);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: season,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SeasonController", method: "getUserActiveSeason" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async getSeasonById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const season = await SeasonData.getSeasonById(id);

      if (!season) {
        throw new ApiError(new Date().toISOString(), "Season not found", HttpStatusCode.NOT_FOUND);
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: season,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SeasonController", method: "getSeasonById" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async createSeason(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as CreateSeasonModel;
      const id = await SeasonData.createSeason({ ...body, user_id: req.dbUser!.id });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        data: { id },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SeasonController", method: "createSeason" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async updateSeason(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const body = req.body as UpdateSeasonModel;

      const season = await SeasonData.getSeasonById(id);
      if (!season) {
        throw new ApiError(new Date().toISOString(), "Season not found", HttpStatusCode.NOT_FOUND);
      }

      await SeasonData.updateSeason(id, body);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SeasonController", method: "updateSeason" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async deleteSeason(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      const season = await SeasonData.getSeasonById(id);
      if (!season) {
        throw new ApiError(new Date().toISOString(), "Season not found", HttpStatusCode.NOT_FOUND);
      }

      await SeasonData.deleteSeason(id);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SeasonController", method: "deleteSeason" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  // Race controllers
  public static async createRace(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as CreateRaceModel;

      const season = await SeasonData.getSeasonById(body.season_id);
      if (!season) {
        throw new ApiError(new Date().toISOString(), "Season not found", HttpStatusCode.NOT_FOUND);
      }

      const id = await SeasonData.createRace(body);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        data: { id },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SeasonController", method: "createRace" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async updateRace(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const body = req.body as UpdateRaceModel;

      const race = await SeasonData.getRaceById(id);
      if (!race) {
        throw new ApiError(new Date().toISOString(), "Race not found", HttpStatusCode.NOT_FOUND);
      }

      await SeasonData.updateRace(id, body);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SeasonController", method: "updateRace" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async deleteRace(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      const race = await SeasonData.getRaceById(id);
      if (!race) {
        throw new ApiError(new Date().toISOString(), "Race not found", HttpStatusCode.NOT_FOUND);
      }

      await SeasonData.deleteRace(id);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SeasonController", method: "deleteRace" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  // Phase controllers
  public static async createPhase(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as CreatePhaseModel;

      const race = await SeasonData.getRaceById(body.race_id);
      if (!race) {
        throw new ApiError(new Date().toISOString(), "Race not found", HttpStatusCode.NOT_FOUND);
      }

      const id = await SeasonData.createPhase(body);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        data: { id },
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SeasonController", method: "createPhase" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async updatePhase(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const body = req.body as UpdatePhaseModel;

      const phase = await SeasonData.getPhaseById(id);
      if (!phase) {
        throw new ApiError(new Date().toISOString(), "Phase not found", HttpStatusCode.NOT_FOUND);
      }

      await SeasonData.updatePhase(id, body);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SeasonController", method: "updatePhase" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }

  public static async deletePhase(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      const phase = await SeasonData.getPhaseById(id);
      if (!phase) {
        throw new ApiError(new Date().toISOString(), "Phase not found", HttpStatusCode.NOT_FOUND);
      }

      await SeasonData.deletePhase(id);

      res.status(HttpStatusCode.OK).json({
        success: true,
      });
    } catch (error) {
      const apiError = ErrorHandler.processError(error);
      Logger.error(apiError, { class: "SeasonController", method: "deletePhase" });
      res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
      });
    }
  }
}
