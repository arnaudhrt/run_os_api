-- Migration: make_workout_type_nullable
-- Created: 2025-12-26
-- Description: Make workout_type column nullable to support Garmin activities without workout type

-- UP
ALTER TABLE activities ALTER COLUMN workout_type DROP NOT NULL;
ALTER TABLE activities ALTER COLUMN workout_type SET DEFAULT NULL;

-- ROLLBACK
ALTER TABLE activities ALTER COLUMN workout_type SET NOT NULL;
ALTER TABLE activities ALTER COLUMN workout_type DROP DEFAULT;
