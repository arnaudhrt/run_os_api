-- Migration: add_player_id_and_modify_difficulty
-- Created: 2025-11-16T07:03:35.422Z

-- UP
-- Add player_id column (8-character string)
ALTER TABLE songs ADD COLUMN player_id VARCHAR(8) DEFAULT NULL;

ALTER TABLE songs DROP COLUMN difficulty;
ALTER TABLE songs ADD COLUMN difficulty_array TEXT[];


-- ROLLBACK
-- Restore the original difficulty column



