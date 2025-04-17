CREATE TYPE "public"."achievement_type" AS ENUM('streak', 'milestone', 'quality', 'special', 'onboarding', 'engagement', 'referral', 'creator');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'non-binary', 'transgender', 'genderqueer', 'gender-fluid', 'other', 'any');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" "achievement_type" NOT NULL,
	"icon_url" text,
	"points" integer DEFAULT 0 NOT NULL,
	"requirements" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "chat_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"preferred_gender" "gender" DEFAULT 'any',
	"country" text
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user1_id" integer,
	"user2_id" integer,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"active" boolean DEFAULT true,
	"algorithm_id" integer,
	"match_quality_score" real
);
--> statement-breakpoint
CREATE TABLE "matching_algorithm_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parameters" jsonb NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matching_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer,
	"feedback_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"sender_id" integer,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"detected_language" text,
	"is_translated" boolean DEFAULT false,
	"original_content" text
);
--> statement-breakpoint
CREATE TABLE "private_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"token_rate" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"tokens_spent" integer DEFAULT 0 NOT NULL,
	"minutes_active" integer DEFAULT 0 NOT NULL,
	"creator_rating" integer,
	"user_rating" integer
);
--> statement-breakpoint
CREATE TABLE "referral_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_creator_code" boolean DEFAULT false NOT NULL,
	"bonus_percentage" integer DEFAULT 0,
	CONSTRAINT "referral_codes_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "referral_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referral_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"value" jsonb NOT NULL,
	"required_referrals" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"icon_url" text
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" integer NOT NULL,
	"referred_id" integer NOT NULL,
	"referral_code" text NOT NULL,
	"referred_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reward_claimed" boolean DEFAULT false NOT NULL,
	"reward_claimed_at" timestamp,
	CONSTRAINT "referrals_referred_id_unique" UNIQUE("referred_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" integer,
	"reported_id" integer,
	"session_id" integer,
	"reason" text NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now(),
	"resolved" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "social_shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" integer,
	"type" text NOT NULL,
	"content" text,
	"media_url" text,
	"share_url" text NOT NULL,
	"platform" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"converted_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supported_languages" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"native_name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"direction" text DEFAULT 'ltr' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translation_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_text" text NOT NULL,
	"source_language" text NOT NULL,
	"target_language" text NOT NULL,
	"translated_text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL,
	"use_count" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translation_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"source_language" text NOT NULL,
	"target_language" text NOT NULL,
	"translation_count" integer DEFAULT 0 NOT NULL,
	"cache_hit_count" integer DEFAULT 0 NOT NULL,
	"api_call_count" integer DEFAULT 0 NOT NULL,
	"character_count" integer DEFAULT 0 NOT NULL,
	"average_latency_ms" integer,
	"error_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"achievement_id" integer NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	"displayed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_algorithm_assignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"algorithm_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_interaction_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"total_chats" integer DEFAULT 0 NOT NULL,
	"avg_chat_duration" integer DEFAULT 0 NOT NULL,
	"chat_accept_rate" real DEFAULT 0 NOT NULL,
	"chat_reject_count" integer DEFAULT 0 NOT NULL,
	"preferred_chat_hours" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"interest" text NOT NULL,
	"weight" real DEFAULT 1 NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_referral_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"reward_id" integer NOT NULL,
	"claimed_at" timestamp DEFAULT now() NOT NULL,
	"applied_at" timestamp,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"streak_type" text NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_update_date" date NOT NULL,
	"streak_start_date" date,
	"protection_used" boolean DEFAULT false NOT NULL,
	"streak_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"uid" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"is_premium" boolean DEFAULT false,
	"premium_until" timestamp,
	"premium_tier" text,
	"gender" "gender" DEFAULT 'any',
	"ban_count" integer DEFAULT 0,
	"last_active" timestamp DEFAULT now(),
	"ip_address" text,
	"interests" jsonb,
	"matching_score" integer,
	"last_matched_at" timestamp,
	"session_count" integer DEFAULT 0,
	"preferred_language" text DEFAULT 'en',
	"referral_count" integer DEFAULT 0,
	"was_referred" boolean DEFAULT false,
	"referred_by" integer,
	"tokens" integer DEFAULT 0,
	"is_creator" boolean DEFAULT false,
	"creator_bio" text,
	"creator_settings" jsonb,
	"country" text,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "waiting_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"preferred_gender" "gender" DEFAULT 'any',
	"country" text,
	"joined_at" timestamp DEFAULT now(),
	"preferred_topics" text[],
	"matching_priority" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "chat_preferences" ADD CONSTRAINT "chat_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user1_id_users_id_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user2_id_users_id_fk" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matching_feedback" ADD CONSTRAINT "matching_feedback_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matching_feedback" ADD CONSTRAINT "matching_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private_rooms" ADD CONSTRAINT "private_rooms_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private_rooms" ADD CONSTRAINT "private_rooms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_users_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referral_code_referral_codes_code_fk" FOREIGN KEY ("referral_code") REFERENCES "public"."referral_codes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_id_users_id_fk" FOREIGN KEY ("reported_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_shares" ADD CONSTRAINT "social_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_shares" ADD CONSTRAINT "social_shares_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_algorithm_assignment" ADD CONSTRAINT "user_algorithm_assignment_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_algorithm_assignment" ADD CONSTRAINT "user_algorithm_assignment_algorithm_id_matching_algorithm_config_id_fk" FOREIGN KEY ("algorithm_id") REFERENCES "public"."matching_algorithm_config"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interaction_metrics" ADD CONSTRAINT "user_interaction_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_referral_rewards" ADD CONSTRAINT "user_referral_rewards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_referral_rewards" ADD CONSTRAINT "user_referral_rewards_reward_id_referral_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."referral_rewards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_users_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waiting_queue" ADD CONSTRAINT "waiting_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;