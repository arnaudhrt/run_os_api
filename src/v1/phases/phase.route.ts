import express from "express";
import { PhaseController } from "./phase.controller";
import { verifyCreatePhaseFields, verifyUpdatePhaseFields } from "./phase.middleware";
import { verifyToken, requireUser } from "@/v1/auth/auth.middleware";

const router = express.Router();

router.get("/cycle/:cycleId", verifyToken, requireUser, PhaseController.getPhasesByCycleId);
router.get("/:id", verifyToken, requireUser, PhaseController.getPhaseById);
router.post("/", verifyToken, requireUser, verifyCreatePhaseFields, PhaseController.createPhase);
router.put("/:id", verifyToken, requireUser, verifyUpdatePhaseFields, PhaseController.updatePhase);
router.delete("/:id", verifyToken, requireUser, PhaseController.deletePhase);

export default router;
