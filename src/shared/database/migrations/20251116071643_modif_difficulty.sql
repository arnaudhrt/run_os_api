-- Migration: modif_difficulty
-- Created: 2025-11-16T07:16:43.833Z

-- UP
ALTER TABLE songs DROP COLUMN difficulty_array;
ALTER TABLE songs ADD COLUMN difficulty TEXT[];

-- ROLLBACK
