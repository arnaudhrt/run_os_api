import * as dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3001,
  HOST: process.env.HOST || "localhost",
  FRONTEND_APP_URL: process.env.FRONTEND_APP_URL || "http://localhost:5173",
  API_URL: process.env.API_URL || "http://localhost:3001",
  DATABASE_URL: process.env.DATABASE_URL || "",
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS || true,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "",
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || "",
  STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID || "",
  STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET || "",
  ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET || "",
};
