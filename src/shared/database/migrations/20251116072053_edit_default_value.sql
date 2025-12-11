-- Migration: edit_default_value
-- Created: 2025-11-16T07:20:53.935Z

-- UP
ALTER TABLE songs ALTER COLUMN player_id SET NOT NULL;

-- ROLLBACK
