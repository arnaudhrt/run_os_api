-- Migration: update_race_result_fields
-- Created: 2026-01-03
-- Description: Replace result_place string with specific numeric placement fields

-- UP

-- Step 1: Drop the old result_place column
ALTER TABLE races DROP COLUMN IF EXISTS result_place;

-- Step 2: Add new placement columns
ALTER TABLE races ADD COLUMN result_place_overall INTEGER;
ALTER TABLE races ADD COLUMN result_place_gender INTEGER;
ALTER TABLE races ADD COLUMN result_place_category INTEGER;
ALTER TABLE races ADD COLUMN category_name VARCHAR(100);

-- ROLLBACK
ALTER TABLE races DROP COLUMN IF EXISTS result_place_overall;
ALTER TABLE races DROP COLUMN IF EXISTS result_place_gender;
ALTER TABLE races DROP COLUMN IF EXISTS result_place_category;
ALTER TABLE races DROP COLUMN IF EXISTS category_name;
ALTER TABLE races ADD COLUMN result_place VARCHAR(255);
