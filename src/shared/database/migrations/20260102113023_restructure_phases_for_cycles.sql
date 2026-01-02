-- Migration: restructure_phases_for_cycles
-- Created: 2026-01-02
-- Description: Restructure phases table to belong to training_cycles instead of users/races

-- UP

-- Step 1: Drop existing indexes
DROP INDEX IF EXISTS idx_phases_user_id;
DROP INDEX IF EXISTS idx_phases_race_id;
DROP INDEX IF EXISTS idx_phases_dates;

-- Step 2: Drop existing foreign key constraints
ALTER TABLE phases DROP CONSTRAINT IF EXISTS phases_race_id_fkey;
ALTER TABLE phases DROP CONSTRAINT IF EXISTS phases_user_id_fkey;

-- Step 3: Drop columns we no longer need
ALTER TABLE phases DROP COLUMN IF EXISTS user_id;
ALTER TABLE phases DROP COLUMN IF EXISTS race_id;
ALTER TABLE phases DROP COLUMN IF EXISTS description;
ALTER TABLE phases DROP COLUMN IF EXISTS weekly_volume_target_km;
ALTER TABLE phases DROP COLUMN IF EXISTS weekly_elevation_target_m;

-- Step 4: Add new columns
ALTER TABLE phases ADD COLUMN cycle_id UUID NOT NULL REFERENCES training_cycles(id) ON DELETE CASCADE;
ALTER TABLE phases ADD COLUMN "order" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE phases ADD COLUMN duration_weeks INTEGER NOT NULL DEFAULT 1;

-- Step 5: Create new indexes
CREATE INDEX idx_phases_cycle_id ON phases(cycle_id);
CREATE INDEX idx_phases_dates ON phases(start_date, end_date);

-- ROLLBACK
-- Note: This is a destructive migration, rollback would require recreating the old structure
-- DROP INDEX IF EXISTS idx_phases_cycle_id;
-- DROP INDEX IF EXISTS idx_phases_dates;
-- ALTER TABLE phases DROP COLUMN cycle_id;
-- ALTER TABLE phases DROP COLUMN "order";
-- ALTER TABLE phases DROP COLUMN duration_weeks;
-- ALTER TABLE phases ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
-- ALTER TABLE phases ADD COLUMN race_id UUID REFERENCES races(id) ON DELETE SET NULL;
-- ALTER TABLE phases ADD COLUMN description TEXT;
-- ALTER TABLE phases ADD COLUMN weekly_volume_target_km DECIMAL(10,2);
-- ALTER TABLE phases ADD COLUMN weekly_elevation_target_m INTEGER;
