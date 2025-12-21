import express from "express";
import { StravaController } from "./strava.controller";
import { verifyCallbackQuery } from "./strava.middleware";
import { verifyToken, requireUser } from "@/v1/auth/auth.middleware";

const router = express.Router();

// Get OAuth URL for Strava authorization (requires auth)
router.get("/auth-url", verifyToken, requireUser, StravaController.getAuthUrl);

// OAuth callback from Strava
router.get("/callback", verifyCallbackQuery, StravaController.handleCallback);

// Get connection status (requires auth)
router.get("/status", verifyToken, requireUser, StravaController.getConnectionStatus);

// Disconnect Strava account (requires auth)
router.post("/disconnect", verifyToken, requireUser, StravaController.disconnect);

// Sync activities from Strava (requires auth)
router.post("/sync", verifyToken, requireUser, StravaController.syncActivities);

export default router;
