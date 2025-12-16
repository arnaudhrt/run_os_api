import express from "express";
import { verifyToken, requireUser } from "@/v1/auth/auth.middleware";
import { ActivityController } from "./activity.controller";
import {
  verifyCreateActivityFields,
  verifyCreateBulkActivityFields,
  verifyUpdateActivityFields,
} from "./activity.middleware";

const router = express.Router();

router.get("/", verifyToken, requireUser, ActivityController.getAllUserActivities);
router.get("/search", verifyToken, requireUser, ActivityController.getUserActivitiesBySearch);
router.post("/", verifyToken, requireUser, verifyCreateActivityFields, ActivityController.createActivity);
router.post("/bulk", verifyToken, requireUser, verifyCreateBulkActivityFields, ActivityController.createBulkActivity);
router.put("/:id", verifyToken, verifyUpdateActivityFields, ActivityController.updateActivity);
router.delete("/:id", verifyToken, ActivityController.deleteActivity);

export default router;
