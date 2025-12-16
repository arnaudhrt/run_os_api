-- Migration: create_seasons_races_phases_tables
-- Created: 2024-12-16

-- UP

-- Create seasons table
CREATE TABLE seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create races table
CREATE TABLE races (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  race_date DATE NOT NULL,
  distance_meters INTEGER DEFAULT NULL,
  elevation_gain_meters INTEGER DEFAULT NULL,
  target_time_seconds INTEGER DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  race_type VARCHAR(50) NOT NULL,
  priority SMALLINT NOT NULL CHECK (priority IN (1, 2, 3)),
  notes TEXT DEFAULT NULL,
  result_time_seconds INTEGER DEFAULT NULL,
  result_place VARCHAR(100) DEFAULT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create phases table
CREATE TABLE phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  phase_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT DEFAULT NULL,
  weekly_volume_target_km DECIMAL(10,2) DEFAULT NULL,
  weekly_elevation_target_m INTEGER DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_seasons_user_id ON seasons(user_id);
CREATE INDEX idx_seasons_dates ON seasons(start_date, end_date);
CREATE INDEX idx_races_season_id ON races(season_id);
CREATE INDEX idx_races_race_date ON races(race_date);
CREATE INDEX idx_phases_race_id ON phases(race_id);
CREATE INDEX idx_phases_dates ON phases(start_date, end_date);

-- ROLLBACK
DROP TABLE phases;
DROP TABLE races;
DROP TABLE seasons;
