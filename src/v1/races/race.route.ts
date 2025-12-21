import express from "express";
import { RaceController } from "./race.controller";
import { verifyCreateRaceFields, verifyUpdateRaceFields } from "./race.middleware";
import { verifyToken, requireUser } from "@/v1/auth/auth.middleware";

const router = express.Router();

router.get("/", verifyToken, requireUser, RaceController.getAllRaces);
router.get("/:id", verifyToken, requireUser, RaceController.getRaceById);
router.post("/", verifyToken, requireUser, verifyCreateRaceFields, RaceController.createRace);
router.put("/:id", verifyToken, requireUser, verifyUpdateRaceFields, RaceController.updateRace);
router.delete("/:id", verifyToken, requireUser, RaceController.deleteRace);

export default router;
