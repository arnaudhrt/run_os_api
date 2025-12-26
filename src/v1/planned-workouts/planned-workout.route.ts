import express from "express";
import { verifyToken, requireUser } from "@/v1/auth/auth.middleware";
import { PlannedWorkoutController } from "./planned-workout.controller";
import {
  verifyCreatePlannedWorkoutFields,
  verifyUpdatePlannedWorkoutFields,
  verifyLinkActivityFields,
  verifyDateRangeQuery,
} from "./planned-workout.middleware";

const router = express.Router();

router.get("/", verifyToken, requireUser, verifyDateRangeQuery, PlannedWorkoutController.getByDateRange);
router.post("/", verifyToken, requireUser, verifyCreatePlannedWorkoutFields, PlannedWorkoutController.create);
router.put("/:id", verifyToken, requireUser, verifyUpdatePlannedWorkoutFields, PlannedWorkoutController.update);
router.delete("/:id", verifyToken, requireUser, PlannedWorkoutController.delete);
router.post("/:id/link-activity", verifyToken, requireUser, verifyLinkActivityFields, PlannedWorkoutController.linkActivity);

export default router;
