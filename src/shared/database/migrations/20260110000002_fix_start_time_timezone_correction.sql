-- Migration: fix_start_time_timezone_correction
-- Created: 2026-01-10
-- Description: Correct the previous migration - we added 7 hours but should have kept original time
--              The timestamps need to be converted back by subtracting 7 hours

-- UP

-- Subtract the 7 hours that were incorrectly added in the previous migration
UPDATE activities
SET start_time = TO_CHAR(start_time::TIMESTAMP - INTERVAL '7 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');

-- ROLLBACK
-- UPDATE activities
-- SET start_time = TO_CHAR(start_time::TIMESTAMP + INTERVAL '7 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
