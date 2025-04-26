# StrangerWave Database Schema Updates for Phase 1

This document outlines the database schema changes required to implement the high-priority features for enhancing StrangerWave's valuation.

## 1. AI-Powered Matching System

### New Tables

#### `user_interaction_metrics`
Stores metrics on user chat interactions for matching algorithm optimization:

```sql
CREATE TABLE user_interaction_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  total_chats INTEGER NOT NULL DEFAULT 0,
  avg_chat_duration INTEGER NOT NULL DEFAULT 0, -- in seconds
  chat_accept_rate REAL NOT NULL DEFAULT 0, -- 0.0 to 1.0
  chat_reject_count INTEGER NOT NULL DEFAULT 0,
  preferred_chat_hours JSONB, -- e.g. {"morning": 0.7, "afternoon": 0.2, "evening": 0.1}
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `user_interests`
Tracks user interests extracted from conversations for better matching:

```sql
CREATE TABLE user_interests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  interest TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 1.0, -- 0.0 to 5.0 indicating strength of interest
  source TEXT NOT NULL, -- "explicit" (user-selected) or "derived" (from conversations)
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `matching_feedback`
Collects user feedback on match quality:

```sql
CREATE TABLE matching_feedback (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES chat_sessions(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  rating INTEGER, -- 1-5 rating
  feedback_text TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `matching_algorithm_config`
Stores parameters for matching algorithm to enable A/B testing:

```sql
CREATE TABLE matching_algorithm_config (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL, -- e.g. {"interest_weight": 0.7, "location_weight": 0.3}
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `user_algorithm_assignment`
Records which algorithm version a user is assigned to for A/B testing:

```sql
CREATE TABLE user_algorithm_assignment (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  algorithm_id INTEGER NOT NULL REFERENCES matching_algorithm_config(id),
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Updates to Existing Tables

#### `users` table
Additional fields for AI matching:

```sql
ALTER TABLE users 
ADD COLUMN interests JSONB, -- Quick access to top interests
ADD COLUMN matching_score INTEGER, -- Internal score used for priority matching
ADD COLUMN last_matched_at TIMESTAMP; -- Track when user was last matched
```

#### `chat_sessions` table
Additional fields for tracking algorithm effectiveness:

```sql
ALTER TABLE chat_sessions 
ADD COLUMN algorithm_id INTEGER REFERENCES matching_algorithm_config(id),
ADD COLUMN match_quality_score REAL; -- Calculated based on duration, message count, etc.
```

#### `waiting_queue` table
Additional fields for smarter matching:

```sql
ALTER TABLE waiting_queue 
ADD COLUMN preferred_topics TEXT[],
ADD COLUMN matching_priority INTEGER DEFAULT 0; -- Higher number = higher priority
```

## 2. Real-Time Translation

### New Tables

#### `language_preferences`
Stores user language settings:

```sql
CREATE TABLE language_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  primary_language TEXT NOT NULL, -- ISO language code
  secondary_languages TEXT[], -- Additional languages user understands
  auto_translate BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `translated_messages`
Caches message translations to reduce API costs:

```sql
CREATE TABLE translated_messages (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id),
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  translated_content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, target_language)
);
```

### Updates to Existing Tables

#### `messages` table
Additional fields for translation:

```sql
ALTER TABLE messages 
ADD COLUMN detected_language TEXT,
ADD COLUMN was_translated BOOLEAN DEFAULT false;
```

## 3. Streak Rewards & Milestone Badges

### New Tables

#### `achievements`
Defines available achievements:

```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- "streak", "milestone", "quality", "special"
  icon_url TEXT,
  points INTEGER NOT NULL DEFAULT 0, -- Gamification points awarded
  requirements JSONB NOT NULL, -- Logic requirements to earn this achievement
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `user_achievements`
Tracks achievements earned by users:

```sql
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  achievement_id INTEGER NOT NULL REFERENCES achievements(id),
  earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  displayed BOOLEAN NOT NULL DEFAULT false, -- Whether it's been shown to user
  UNIQUE(user_id, achievement_id)
);
```

#### `user_streaks`
Tracks user login and activity streaks:

```sql
CREATE TABLE user_streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  current_login_streak INTEGER NOT NULL DEFAULT 0,
  longest_login_streak INTEGER NOT NULL DEFAULT 0,
  current_chat_streak INTEGER NOT NULL DEFAULT 0, -- Days with at least one chat
  longest_chat_streak INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Updates to Existing Tables

#### `users` table
Additional fields for achievement tracking:

```sql
ALTER TABLE users 
ADD COLUMN achievement_points INTEGER DEFAULT 0,
ADD COLUMN total_achievement_count INTEGER DEFAULT 0;
```

## 4. Referral Program

### New Tables

#### `referral_codes`
Stores unique referral codes for users:

```sql
CREATE TABLE referral_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true
);
```

#### `referrals`
Tracks referral relationships between users:

```sql
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER NOT NULL REFERENCES users(id),
  referred_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  referral_code TEXT NOT NULL REFERENCES referral_codes(code),
  referred_at TIMESTAMP NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending', -- "pending", "qualified", "rewarded"
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  reward_claimed_at TIMESTAMP
);
```

#### `referral_rewards`
Defines available rewards for successful referrals:

```sql
CREATE TABLE referral_rewards (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- "premium_days", "discount", "badge", etc.
  value JSONB NOT NULL, -- e.g. {"days": 30} or {"percent_off": 20}
  required_referrals INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true
);
```

#### `user_referral_rewards`
Tracks rewards claimed by users:

```sql
CREATE TABLE user_referral_rewards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  reward_id INTEGER NOT NULL REFERENCES referral_rewards(id),
  claimed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  applied_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

### Updates to Existing Tables

#### `users` table
Additional fields for referral program:

```sql
ALTER TABLE users 
ADD COLUMN referral_count INTEGER DEFAULT 0,
ADD COLUMN was_referred BOOLEAN DEFAULT false,
ADD COLUMN referred_by INTEGER REFERENCES users(id);
```