-- Migration: restructure_for_integrations
-- Created: 2024-12-19

-- UP

-- 1. Remove the old flat columns from users
ALTER TABLE users 
DROP COLUMN IF EXISTS garmin_user_id,
DROP COLUMN IF EXISTS strava_athlete_id;

-- 2. Create the Strava Connections table
CREATE TABLE strava_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strava_athlete_id BIGINT UNIQUE NOT NULL,
  
  -- OAuth Credentials
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL, -- We'll convert the Unix timestamp from Strava to a PG Timestamp
  
  -- Metadata for Syncing
  scope TEXT, -- e.g., "read,activity:read_all"
  last_sync_at TIMESTAMP DEFAULT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensure one user only has one strava account (optional, based on your logic)
  CONSTRAINT unique_user_strava UNIQUE(user_id)
);

-- Index for lookup during Webhooks or API responses
CREATE INDEX idx_strava_athlete_id ON strava_accounts(strava_athlete_id);

-- ROLLBACK
-- ALTER TABLE users ADD COLUMN garmin_user_id VARCHAR(255);
-- ALTER TABLE users ADD COLUMN strava_athlete_id BIGINT;
-- DROP TABLE IF EXISTS strava_accounts;