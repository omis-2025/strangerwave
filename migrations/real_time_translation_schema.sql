-- Real-Time Translation Schema Upgrades

-- Add language preferences to users table
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "preferred_language" VARCHAR(10) DEFAULT 'en';

-- Add translation metadata to messages table
ALTER TABLE "messages"
  ADD COLUMN IF NOT EXISTS "detected_language" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "is_translated" BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "original_content" TEXT;

-- Create translations cache table for optimization
CREATE TABLE IF NOT EXISTS "translation_cache" (
  "id" SERIAL PRIMARY KEY,
  "source_text" TEXT NOT NULL,
  "source_language" VARCHAR(10) NOT NULL,
  "target_language" VARCHAR(10) NOT NULL,
  "translated_text" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_used_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "use_count" INTEGER NOT NULL DEFAULT 1
);

-- Create unique index on the combination of source text, source language, and target language
CREATE UNIQUE INDEX IF NOT EXISTS idx_translation_cache_source_target
  ON "translation_cache" ("source_text", "source_language", "target_language");

-- Create index for fast lookup by source text
CREATE INDEX IF NOT EXISTS idx_translation_cache_source_text
  ON "translation_cache" ("source_text");

-- Create translation activity metrics table for analytics
CREATE TABLE IF NOT EXISTS "translation_metrics" (
  "id" SERIAL PRIMARY KEY,
  "date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "source_language" VARCHAR(10) NOT NULL,
  "target_language" VARCHAR(10) NOT NULL,
  "translation_count" INTEGER NOT NULL DEFAULT 0,
  "cache_hit_count" INTEGER NOT NULL DEFAULT 0,
  "api_call_count" INTEGER NOT NULL DEFAULT 0,
  "character_count" INTEGER NOT NULL DEFAULT 0,
  "average_latency_ms" INTEGER,
  "error_count" INTEGER NOT NULL DEFAULT 0
);

-- Create unique index on the combination of date, source language, and target language
CREATE UNIQUE INDEX IF NOT EXISTS idx_translation_metrics_date_languages
  ON "translation_metrics" ("date", "source_language", "target_language");

-- Create supported languages table
CREATE TABLE IF NOT EXISTS "supported_languages" (
  "code" VARCHAR(10) PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL,
  "native_name" VARCHAR(50) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "direction" VARCHAR(3) NOT NULL DEFAULT 'ltr',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert initial supported languages
INSERT INTO "supported_languages" ("code", "name", "native_name", "direction")
VALUES 
  ('en', 'English', 'English', 'ltr'),
  ('es', 'Spanish', 'Español', 'ltr'),
  ('fr', 'French', 'Français', 'ltr'),
  ('de', 'German', 'Deutsch', 'ltr'),
  ('it', 'Italian', 'Italiano', 'ltr'),
  ('pt', 'Portuguese', 'Português', 'ltr'),
  ('ru', 'Russian', 'Русский', 'ltr'),
  ('zh', 'Chinese', '中文', 'ltr'),
  ('ja', 'Japanese', '日本語', 'ltr'),
  ('ko', 'Korean', '한국어', 'ltr'),
  ('ar', 'Arabic', 'العربية', 'rtl'),
  ('hi', 'Hindi', 'हिन्दी', 'ltr'),
  ('tr', 'Turkish', 'Türkçe', 'ltr'),
  ('nl', 'Dutch', 'Nederlands', 'ltr'),
  ('pl', 'Polish', 'Polski', 'ltr'),
  ('vi', 'Vietnamese', 'Tiếng Việt', 'ltr'),
  ('th', 'Thai', 'ไทย', 'ltr'),
  ('id', 'Indonesian', 'Bahasa Indonesia', 'ltr'),
  ('ms', 'Malay', 'Bahasa Melayu', 'ltr'),
  ('fa', 'Persian', 'فارسی', 'rtl'),
  ('he', 'Hebrew', 'עברית', 'rtl')
ON CONFLICT DO NOTHING;