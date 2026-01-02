-- Migration: create_training_cycles_table
-- Created: 2026-01-02
-- Description: Create training_cycles table for training blocks anchored to races

-- UP

CREATE TABLE training_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  race_id UUID REFERENCES races(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_weeks INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_training_cycles_user_id ON training_cycles(user_id);
CREATE INDEX idx_training_cycles_race_id ON training_cycles(race_id);
CREATE INDEX idx_training_cycles_dates ON training_cycles(start_date, end_date);

-- ROLLBACK
DROP TABLE training_cycles;
