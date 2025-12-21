import express from "express";
import { GarminController } from "./garmin.controller";
import { verifyToken, requireUser } from "@/v1/auth/auth.middleware";

const router = express.Router();

// Connect Garmin account with credentials
router.post("/connect", verifyToken, requireUser, GarminController.connect);

// Get connection status
router.get("/status", verifyToken, requireUser, GarminController.getConnectionStatus);

// Disconnect Garmin account
router.post("/disconnect", verifyToken, requireUser, GarminController.disconnect);

// Sync activities from Garmin
router.post("/sync", verifyToken, requireUser, GarminController.syncActivities);

// Get Garmin user account info
router.get("/user", verifyToken, requireUser, GarminController.getGarminUser);

export default router;
