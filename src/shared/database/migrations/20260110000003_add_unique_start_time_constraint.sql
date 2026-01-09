-- Migration: add_unique_start_time_constraint
-- Created: 2026-01-10
-- Description: Add unique constraint on (user_id, start_time) to prevent duplicate activities

-- UP

-- Create unique index on user_id and start_time combination
CREATE UNIQUE INDEX idx_activities_user_start_time_unique
ON activities(user_id, start_time);

-- ROLLBACK
-- DROP INDEX IF EXISTS idx_activities_user_start_time_unique;
