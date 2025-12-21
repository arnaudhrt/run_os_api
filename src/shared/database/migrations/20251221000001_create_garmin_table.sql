-- Migration: create_garmin_accounts
-- Created: 2024-12-21

-- UP

-- Create the Garmin Accounts table
CREATE TABLE garmin_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Garmin Credentials (username/password based auth via garmin-connect library)
  garmin_email TEXT NOT NULL,
  garmin_password_encrypted TEXT NOT NULL,

  -- Session tokens from garmin-connect library (stored as JSON)
  oauth1_token JSONB,
  oauth2_token JSONB,

  -- Metadata for Syncing
  last_sync_at TIMESTAMP DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensure one user only has one garmin account
  CONSTRAINT unique_user_garmin UNIQUE(user_id)
);

-- Index for user lookup
CREATE INDEX idx_garmin_user_id ON garmin_accounts(user_id);

-- ROLLBACK
-- DROP TABLE IF EXISTS garmin_accounts;
