-- Migration: set_uncategorized_workout_type_to_null
-- Created: 2026-01-08
-- Description: Set workout_type to NULL for all activities with 'uncategorized' value

-- UP
UPDATE activities SET workout_type = NULL WHERE workout_type = 'uncategorized';

-- ROLLBACK
UPDATE activities SET workout_type = 'uncategorized' WHERE workout_type IS NULL;
