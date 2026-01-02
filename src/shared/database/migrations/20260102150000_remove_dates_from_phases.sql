-- Migration: remove_dates_from_phases
-- Created: 2026-01-02
-- Description: Remove start_date and end_date columns from phases table (dates now derived from cycle)

-- UP

-- Step 1: Drop the index on dates
DROP INDEX IF EXISTS idx_phases_dates;

-- Step 2: Remove the date columns
ALTER TABLE phases DROP COLUMN IF EXISTS start_date;
ALTER TABLE phases DROP COLUMN IF EXISTS end_date;

-- ROLLBACK
-- ALTER TABLE phases ADD COLUMN start_date DATE;
-- ALTER TABLE phases ADD COLUMN end_date DATE;
-- CREATE INDEX idx_phases_dates ON phases(start_date, end_date);
