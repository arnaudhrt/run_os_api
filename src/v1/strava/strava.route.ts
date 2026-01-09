import express from "express";
import { StravaController } from "./strava.controller";
import { verifyCallbackQuery } from "./strava.middleware";
import { verifyToken, requireUser } from "@/v1/auth/auth.middleware";

const router = express.Router();

// Get OAuth URL for Strava authorization
router.get("/auth-url", verifyToken, requireUser, StravaController.getAuthUrl);

// OAuth callback from Strava
router.get("/callback", verifyCallbackQuery, StravaController.handleCallback);

// Get connection status
router.get("/status", verifyToken, requireUser, StravaController.getConnectionStatus);

// Disconnect Strava account
router.post("/disconnect", verifyToken, requireUser, StravaController.disconnect);

// Sync activities from Strava
router.post("/sync", verifyToken, requireUser, StravaController.syncActivities);

// Get Strava user account
router.get("/user", verifyToken, requireUser, StravaController.getStravaUser);

export default router;
