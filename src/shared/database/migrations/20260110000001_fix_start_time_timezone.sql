-- Migration: fix_start_time_timezone
-- Created: 2026-01-10
-- Description: Change start_time from TIMESTAMP to TEXT to store ISO strings without timezone conversion
--              Also fix existing timestamps by adding 7 hours (reverse the UTC+7 offset that was applied)

-- UP

-- Step 1: Add a temporary column to store the corrected ISO string
ALTER TABLE activities ADD COLUMN start_time_new TEXT;

-- Step 2: Convert existing timestamps to ISO strings with timezone correction
-- The timestamps were incorrectly stored 7 hours behind (server interpreted UTC time as local UTC+7)
-- We need to add 7 hours to get back to the original UTC time
UPDATE activities
SET start_time_new = TO_CHAR(start_time + INTERVAL '7 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');

-- Step 3: Drop the old column and rename the new one
ALTER TABLE activities DROP COLUMN start_time;
ALTER TABLE activities RENAME COLUMN start_time_new TO start_time;

-- Step 4: Add NOT NULL constraint
ALTER TABLE activities ALTER COLUMN start_time SET NOT NULL;

-- Step 5: Recreate the index on start_time
DROP INDEX IF EXISTS idx_activities_start_time;
CREATE INDEX idx_activities_start_time ON activities(start_time);

-- ROLLBACK
-- ALTER TABLE activities ADD COLUMN start_time_old TIMESTAMP;
-- UPDATE activities SET start_time_old = (start_time::TIMESTAMP - INTERVAL '7 hours');
-- ALTER TABLE activities DROP COLUMN start_time;
-- ALTER TABLE activities RENAME COLUMN start_time_old TO start_time;
-- ALTER TABLE activities ALTER COLUMN start_time SET NOT NULL;
-- DROP INDEX IF EXISTS idx_activities_start_time;
-- CREATE INDEX idx_activities_start_time ON activities(start_time);
