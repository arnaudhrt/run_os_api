-- Migration: create_activities_table
-- Created: 2024-12-16

-- UP
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  workout_type VARCHAR(50) NOT NULL,
  start_time TIMESTAMP NOT NULL,

  -- Metrics
  distance_meters INTEGER DEFAULT NULL,
  duration_seconds INTEGER DEFAULT NULL,
  elevation_gain_meters INTEGER DEFAULT NULL,
  elevation_loss_meters INTEGER DEFAULT NULL,

  -- Heart rate
  avg_heart_rate SMALLINT DEFAULT NULL,
  max_heart_rate SMALLINT DEFAULT NULL,

  -- Pace (stored as decimal for precision)
  avg_pace_min_per_km DECIMAL(5,2) DEFAULT NULL,
  best_pace_min_per_km DECIMAL(5,2) DEFAULT NULL,

  -- Cadence
  avg_cadence SMALLINT DEFAULT NULL,

  -- User inputs
  rpe SMALLINT DEFAULT NULL CHECK (rpe >= 1 AND rpe <= 10),
  notes TEXT DEFAULT NULL,

  -- Weather
  avg_temperature_celsius DECIMAL(4,1) DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_start_time ON activities(start_time);
CREATE INDEX idx_activities_activity_type ON activities(activity_type);
CREATE INDEX idx_activities_workout_type ON activities(workout_type);

-- ROLLBACK
DROP TABLE activities;
