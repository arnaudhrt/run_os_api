-- Migration: simplify_activities_table
-- Created: 2026-01-08
-- Description: Simplify activities table - remove unused fields, add has_pain and shoes_id

-- UP

-- Step 1: Drop unused columns
ALTER TABLE activities DROP COLUMN IF EXISTS elapsed_duration_seconds;
ALTER TABLE activities DROP COLUMN IF EXISTS elevation_loss_meters;
ALTER TABLE activities DROP COLUMN IF EXISTS avg_speed_mps;
ALTER TABLE activities DROP COLUMN IF EXISTS max_speed_mps;
ALTER TABLE activities DROP COLUMN IF EXISTS steps;
ALTER TABLE activities DROP COLUMN IF EXISTS avg_cadence;
ALTER TABLE activities DROP COLUMN IF EXISTS calories;
ALTER TABLE activities DROP COLUMN IF EXISTS aerobic_training_effect;
ALTER TABLE activities DROP COLUMN IF EXISTS anaerobic_training_effect;
ALTER TABLE activities DROP COLUMN IF EXISTS training_effect_label;
ALTER TABLE activities DROP COLUMN IF EXISTS time_in_zone_1;
ALTER TABLE activities DROP COLUMN IF EXISTS time_in_zone_2;
ALTER TABLE activities DROP COLUMN IF EXISTS time_in_zone_3;
ALTER TABLE activities DROP COLUMN IF EXISTS time_in_zone_4;
ALTER TABLE activities DROP COLUMN IF EXISTS time_in_zone_5;

-- Step 2: Add new columns
ALTER TABLE activities ADD COLUMN has_pain TEXT DEFAULT NULL;
ALTER TABLE activities ADD COLUMN shoes_id UUID DEFAULT NULL;

-- ROLLBACK
-- ALTER TABLE activities ADD COLUMN elapsed_duration_seconds INTEGER DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN elevation_loss_meters INTEGER DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN avg_speed_mps DECIMAL(6,3) DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN max_speed_mps DECIMAL(6,3) DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN steps INTEGER DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN avg_cadence SMALLINT DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN calories INTEGER DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN aerobic_training_effect DECIMAL(3,1) DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN anaerobic_training_effect DECIMAL(3,1) DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN training_effect_label VARCHAR(50) DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN time_in_zone_1 INTEGER DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN time_in_zone_2 INTEGER DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN time_in_zone_3 INTEGER DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN time_in_zone_4 INTEGER DEFAULT NULL;
-- ALTER TABLE activities ADD COLUMN time_in_zone_5 INTEGER DEFAULT NULL;
-- ALTER TABLE activities DROP COLUMN IF EXISTS has_pain;
-- ALTER TABLE activities DROP COLUMN IF EXISTS shoes_id;
