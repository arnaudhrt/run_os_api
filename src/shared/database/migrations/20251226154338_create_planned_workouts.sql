-- Migration: create_planned_workouts_table
-- Created: 2024-12-26
-- Description: Create planned_workouts table for weekly planning (Sunday Ritual workflow)

-- UP

CREATE TABLE planned_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Scheduling
  planned_date DATE NOT NULL,
  time_slot VARCHAR(10) NOT NULL DEFAULT 'single' CHECK (time_slot IN ('am', 'pm', 'single')),
  
  -- Workout definition
  activity_type VARCHAR(50) NOT NULL,
  workout_type VARCHAR(50) NOT NULL,
  target_distance_meters INTEGER DEFAULT NULL,
  target_duration_seconds INTEGER DEFAULT NULL,
  description TEXT DEFAULT NULL,
  
  -- Link to completed activity (manual linking)
  activity_id UUID DEFAULT NULL REFERENCES activities(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for weekly range queries
CREATE INDEX idx_planned_workouts_user_id ON planned_workouts(user_id);
CREATE INDEX idx_planned_workouts_date ON planned_workouts(planned_date);
CREATE INDEX idx_planned_workouts_user_date ON planned_workouts(user_id, planned_date);

-- Prevent duplicate slots (same user, same date, same time_slot)
CREATE UNIQUE INDEX idx_planned_workouts_unique_slot 
  ON planned_workouts(user_id, planned_date, time_slot);

-- ROLLBACK
-- DROP TABLE IF EXISTS planned_workouts;