-- AI Matching Schema Upgrades

-- Add new fields to existing tables
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "interests" JSONB,
  ADD COLUMN IF NOT EXISTS "matching_score" INTEGER,
  ADD COLUMN IF NOT EXISTS "last_matched_at" TIMESTAMP;

ALTER TABLE "chat_sessions" 
  ADD COLUMN IF NOT EXISTS "algorithm_id" INTEGER,
  ADD COLUMN IF NOT EXISTS "match_quality_score" REAL;

ALTER TABLE "waiting_queue" 
  ADD COLUMN IF NOT EXISTS "preferred_topics" TEXT[],
  ADD COLUMN IF NOT EXISTS "matching_priority" INTEGER DEFAULT 0;

-- Create new tables for AI matching

-- User interaction metrics table
CREATE TABLE IF NOT EXISTS "user_interaction_metrics" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "total_chats" INTEGER NOT NULL DEFAULT 0,
  "avg_chat_duration" INTEGER NOT NULL DEFAULT 0,
  "chat_accept_rate" REAL NOT NULL DEFAULT 0,
  "chat_reject_count" INTEGER NOT NULL DEFAULT 0,
  "preferred_chat_hours" JSONB,
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User interests table
CREATE TABLE IF NOT EXISTS "user_interests" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "interest" TEXT NOT NULL,
  "weight" REAL NOT NULL DEFAULT 1.0,
  "source" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Matching feedback table
CREATE TABLE IF NOT EXISTS "matching_feedback" (
  "id" SERIAL PRIMARY KEY,
  "session_id" INTEGER NOT NULL REFERENCES "chat_sessions"("id"),
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "rating" INTEGER,
  "feedback_text" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Matching algorithm configuration table
CREATE TABLE IF NOT EXISTS "matching_algorithm_config" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "parameters" JSONB NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User algorithm assignment table
CREATE TABLE IF NOT EXISTS "user_algorithm_assignment" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "algorithm_id" INTEGER NOT NULL REFERENCES "matching_algorithm_config"("id"),
  "assigned_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_interaction_metrics_user_id ON "user_interaction_metrics"("user_id");
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON "user_interests"("user_id");
CREATE INDEX IF NOT EXISTS idx_matching_feedback_session_id ON "matching_feedback"("session_id");
CREATE INDEX IF NOT EXISTS idx_matching_feedback_user_id ON "matching_feedback"("user_id");
CREATE INDEX IF NOT EXISTS idx_user_algorithm_assignment_user_id ON "user_algorithm_assignment"("user_id");
CREATE INDEX IF NOT EXISTS idx_chat_sessions_algorithm_id ON "chat_sessions"("algorithm_id");

-- Insert default matching algorithms
INSERT INTO "matching_algorithm_config" ("name", "description", "parameters", "is_active")
VALUES 
  ('Basic Interest Matching', 'A simple algorithm that matches users based on common interests', 
   '{"interest_weight": 0.6, "chat_time_weight": 0.2, "duration_weight": 0.2}', TRUE),
  ('Advanced Behavioral Matching', 'An algorithm that prioritizes chat behavior patterns', 
   '{"interest_weight": 0.3, "chat_time_weight": 0.4, "duration_weight": 0.3}', TRUE)
ON CONFLICT DO NOTHING;