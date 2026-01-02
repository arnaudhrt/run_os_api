import express from "express";
import { TrainingCycleController } from "./training-cycle.controller";
import { verifyCreateTrainingCycleFields, verifyUpdateTrainingCycleFields } from "./training-cycle.middleware";
import { verifyToken, requireUser } from "@/v1/auth/auth.middleware";

const router = express.Router();

router.get("/", verifyToken, requireUser, TrainingCycleController.getAllTrainingCycles);
router.get("/:id", verifyToken, requireUser, TrainingCycleController.getTrainingCycleById);
router.post("/", verifyToken, requireUser, verifyCreateTrainingCycleFields, TrainingCycleController.createTrainingCycle);
router.put("/:id", verifyToken, requireUser, verifyUpdateTrainingCycleFields, TrainingCycleController.updateTrainingCycle);
router.delete("/:id", verifyToken, requireUser, TrainingCycleController.deleteTrainingCycle);

export default router;
