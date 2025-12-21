-- Migration: restructure_races_phases_remove_seasons
-- Created: 2024-12-18
-- Description: Remove seasons table, make races and phases independent with user_id

-- UP

-- Step 1: Add user_id to races table
ALTER TABLE races ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Step 2: Populate user_id from seasons
UPDATE races SET user_id = seasons.user_id FROM seasons WHERE races.season_id = seasons.id;

-- Step 3: Make user_id NOT NULL
ALTER TABLE races ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Drop season_id foreign key and column from races
ALTER TABLE races DROP CONSTRAINT races_season_id_fkey;
ALTER TABLE races DROP COLUMN season_id;

-- Step 5: Add user_id to phases table
ALTER TABLE phases ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Step 6: Populate user_id from races
UPDATE phases SET user_id = races.user_id FROM races WHERE phases.race_id = races.id;

-- Step 7: Make user_id NOT NULL
ALTER TABLE phases ALTER COLUMN user_id SET NOT NULL;

-- Step 8: Make race_id optional (drop NOT NULL constraint and update foreign key to SET NULL on delete)
ALTER TABLE phases ALTER COLUMN race_id DROP NOT NULL;
ALTER TABLE phases DROP CONSTRAINT phases_race_id_fkey;
ALTER TABLE phases ADD CONSTRAINT phases_race_id_fkey FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE SET NULL;

-- Step 9: Drop seasons table and its indexes
DROP INDEX IF EXISTS idx_seasons_user_id;
DROP INDEX IF EXISTS idx_seasons_dates;
DROP INDEX IF EXISTS idx_races_season_id;
DROP TABLE seasons;

-- Step 10: Create new indexes
CREATE INDEX idx_races_user_id ON races(user_id);
CREATE INDEX idx_phases_user_id ON phases(user_id);

-- ROLLBACK
-- Note: Rollback would require recreating seasons table and re-linking data
-- This is a one-way migration for simplicity
