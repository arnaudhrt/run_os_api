import express from "express";
import { SeasonController } from "./season.controller";
import {
  verifyCreateSeasonFields,
  verifyUpdateSeasonFields,
  verifyCreateRaceFields,
  verifyUpdateRaceFields,
  verifyCreatePhaseFields,
  verifyUpdatePhaseFields,
} from "./season.middleware";
import { verifyToken, requireUser } from "@/v1/auth/auth.middleware";

const router = express.Router();

// Season routes
router.get("/active", verifyToken, requireUser, SeasonController.getUserActiveSeason);
router.get("/:id", verifyToken, SeasonController.getSeasonById);
router.post("/", verifyToken, requireUser, verifyCreateSeasonFields, SeasonController.createSeason);
router.put("/:id", verifyToken, verifyUpdateSeasonFields, SeasonController.updateSeason);
router.delete("/:id", verifyToken, SeasonController.deleteSeason);

// Race routes
router.post("/race", verifyToken, verifyCreateRaceFields, SeasonController.createRace);
router.put("/race/:id", verifyToken, verifyUpdateRaceFields, SeasonController.updateRace);
router.delete("/race/:id", verifyToken, SeasonController.deleteRace);

// Phase routes
router.post("/phase", verifyToken, verifyCreatePhaseFields, SeasonController.createPhase);
router.put("/phase/:id", verifyToken, verifyUpdatePhaseFields, SeasonController.updatePhase);
router.delete("/phase/:id", verifyToken, SeasonController.deletePhase);

export default router;
