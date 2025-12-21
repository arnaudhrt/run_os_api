import express from "express";
import { GarminController } from "./garmin.controller";
import { verifyToken, requireUser } from "@/v1/auth/auth.middleware";

const router = express.Router();

router.post("/connect", verifyToken, requireUser, GarminController.connect);
router.get("/status", verifyToken, requireUser, GarminController.getConnectionStatus);
router.post("/disconnect", verifyToken, requireUser, GarminController.disconnect);
router.post("/sync", verifyToken, requireUser, GarminController.syncActivities);
router.get("/user", verifyToken, requireUser, GarminController.getGarminUser);

export default router;
