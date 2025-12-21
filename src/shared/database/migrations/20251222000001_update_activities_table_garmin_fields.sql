-- Migration: update_activities_table_garmin_fields
-- Created: 2024-12-22
-- Description: Add Garmin-specific fields and update existing columns to match new ActivityModel

-- UP

-- Add source tracking columns
ALTER TABLE activities ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'manual';
ALTER TABLE activities ADD COLUMN garmin_activity_id VARCHAR(50) DEFAULT NULL;
ALTER TABLE activities ADD COLUMN strava_activity_id BIGINT DEFAULT NULL;

-- Add elapsed duration (total time including pauses)
ALTER TABLE activities ADD COLUMN elapsed_duration_seconds INTEGER DEFAULT NULL;

-- Add speed columns (replacing pace columns)
ALTER TABLE activities ADD COLUMN avg_speed_mps DECIMAL(6,3) DEFAULT NULL;
ALTER TABLE activities ADD COLUMN max_speed_mps DECIMAL(6,3) DEFAULT NULL;

-- Add steps
ALTER TABLE activities ADD COLUMN steps INTEGER DEFAULT NULL;

-- Add calories
ALTER TABLE activities ADD COLUMN calories INTEGER DEFAULT NULL;

-- Add training effect fields
ALTER TABLE activities ADD COLUMN aerobic_training_effect DECIMAL(3,1) DEFAULT NULL;
ALTER TABLE activities ADD COLUMN anaerobic_training_effect DECIMAL(3,1) DEFAULT NULL;
ALTER TABLE activities ADD COLUMN training_effect_label VARCHAR(50) DEFAULT NULL;

-- Add heart rate zone times (in seconds)
ALTER TABLE activities ADD COLUMN time_in_zone_1 INTEGER DEFAULT NULL;
ALTER TABLE activities ADD COLUMN time_in_zone_2 INTEGER DEFAULT NULL;
ALTER TABLE activities ADD COLUMN time_in_zone_3 INTEGER DEFAULT NULL;
ALTER TABLE activities ADD COLUMN time_in_zone_4 INTEGER DEFAULT NULL;
ALTER TABLE activities ADD COLUMN time_in_zone_5 INTEGER DEFAULT NULL;

-- Add PR flag
ALTER TABLE activities ADD COLUMN is_pr BOOLEAN DEFAULT FALSE;

-- Drop old pace columns (replaced by speed)
ALTER TABLE activities DROP COLUMN IF EXISTS avg_pace_min_per_km;
ALTER TABLE activities DROP COLUMN IF EXISTS best_pace_min_per_km;

-- Create indexes for new columns
CREATE INDEX idx_activities_source ON activities(source);
CREATE UNIQUE INDEX idx_activities_garmin_id ON activities(garmin_activity_id) WHERE garmin_activity_id IS NOT NULL;
CREATE UNIQUE INDEX idx_activities_strava_id ON activities(strava_activity_id) WHERE strava_activity_id IS NOT NULL;

-- ROLLBACK
ALTER TABLE activities DROP COLUMN IF EXISTS source;
ALTER TABLE activities DROP COLUMN IF EXISTS garmin_activity_id;
ALTER TABLE activities DROP COLUMN IF EXISTS strava_activity_id;
ALTER TABLE activities DROP COLUMN IF EXISTS elapsed_duration_seconds;
ALTER TABLE activities DROP COLUMN IF EXISTS avg_speed_mps;
ALTER TABLE activities DROP COLUMN IF EXISTS max_speed_mps;
ALTER TABLE activities DROP COLUMN IF EXISTS steps;
ALTER TABLE activities DROP COLUMN IF EXISTS calories;
ALTER TABLE activities DROP COLUMN IF EXISTS aerobic_training_effect;
ALTER TABLE activities DROP COLUMN IF EXISTS anaerobic_training_effect;
ALTER TABLE activities DROP COLUMN IF EXISTS training_effect_label;
ALTER TABLE activities DROP COLUMN IF EXISTS time_in_zone_1;
ALTER TABLE activities DROP COLUMN IF EXISTS time_in_zone_2;
ALTER TABLE activities DROP COLUMN IF EXISTS time_in_zone_3;
ALTER TABLE activities DROP COLUMN IF EXISTS time_in_zone_4;
ALTER TABLE activities DROP COLUMN IF EXISTS time_in_zone_5;
ALTER TABLE activities DROP COLUMN IF EXISTS is_pr;
ALTER TABLE activities ADD COLUMN avg_pace_min_per_km DECIMAL(5,2) DEFAULT NULL;
ALTER TABLE activities ADD COLUMN best_pace_min_per_km DECIMAL(5,2) DEFAULT NULL;
DROP INDEX IF EXISTS idx_activities_source;
DROP INDEX IF EXISTS idx_activities_garmin_id;
DROP INDEX IF EXISTS idx_activities_strava_id;
