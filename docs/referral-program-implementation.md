# Referral Program Implementation

This document outlines the implementation plan for adding a referral system to StrangerWave, enabling users to invite friends and earn rewards.

## 1. Schema Updates for Drizzle ORM

Here are the schema extensions for the referral program:

```typescript
// Additional imports needed in shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// New tables for referral system

export const referralCodes = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id).notNull(),
  referredId: integer("referred_id").references(() => users.id).notNull().unique(),
  referralCode: text("referral_code").references(() => referralCodes.code).notNull(),
  referredAt: timestamp("referred_at").defaultNow().notNull(),
  status: text("status").default('pending').notNull(), // "pending", "qualified", "rewarded"
  rewardClaimed: boolean("reward_claimed").default(false).notNull(),
  rewardClaimedAt: timestamp("reward_claimed_at"),
});

export const referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "premium_days", "discount", "badge"
  value: jsonb("value").notNull(), // e.g. {"days": 30} or {"percent_off": 20}
  requiredReferrals: integer("required_referrals").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const userReferralRewards = pgTable("user_referral_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rewardId: integer("reward_id").references(() => referralRewards.id).notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  appliedAt: timestamp("applied_at"),
  expiresAt: timestamp("expires_at"),
});

// Create insert schemas
export const insertReferralCodeSchema = createInsertSchema(referralCodes).omit({
  id: true,
  createdAt: true
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  referredAt: true
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).omit({
  id: true
});

export const insertUserReferralRewardSchema = createInsertSchema(userReferralRewards).omit({
  id: true,
  claimedAt: true
});

// Export types
export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;
export type ReferralCode = typeof referralCodes.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;

export type InsertUserReferralReward = z.infer<typeof insertUserReferralRewardSchema>;
export type UserReferralReward = typeof userReferralRewards.$inferSelect;

// Users table updates - this would be done via migration
// Additional fields needed:
// - referralCount: integer
// - wasReferred: boolean
// - referredBy: integer (references users.id)
```

## 2. Referral System Implementation

### 2.1 Referral Code Generation

First, let's create a service to manage referral codes:

```typescript
// server/services/referrals.ts

import { customAlphabet } from 'nanoid';
import { storage } from '../storage';

// Create a nanoid generator for referral codes
// Using numbers and uppercase letters, avoiding similar-looking characters
const generateReferralCode = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

/**
 * Get or create a referral code for a user
 */
export async function getUserReferralCode(userId: number): Promise<string> {
  try {
    // Check if user already has a referral code
    const existingCode = await storage.getUserReferralCode(userId);
    if (existingCode) {
      return existingCode.code;
    }
    
    // Generate a new unique code
    let code = generateReferralCode();
    
    // Ensure code is unique by checking against existing codes
    let isUnique = false;
    while (!isUnique) {
      const existingWithCode = await storage.getReferralCodeByCode(code);
      if (!existingWithCode) {
        isUnique = true;
      } else {
        code = generateReferralCode();
      }
    }
    
    // Create new referral code in database
    const referralCode = await storage.createReferralCode({
      userId,
      code,
      isActive: true
    });
    
    return referralCode.code;
  } catch (error) {
    console.error('Error generating referral code:', error);
    throw new Error('Failed to generate referral code');
  }
}

/**
 * Process a referral when a new user signs up using a referral code
 */
export async function processReferral(referredUserId: number, referralCode: string): Promise<boolean> {
  try {
    // Find the referral code
    const code = await storage.getReferralCodeByCode(referralCode);
    if (!code || !code.isActive) {
      return false;
    }
    
    // Get the referrer
    const referrer = await storage.getUser(code.userId);
    if (!referrer) {
      return false;
    }
    
    // Prevent self-referrals
    if (referrer.id === referredUserId) {
      return false;
    }
    
    // Create referral record
    await storage.createReferral({
      referrerId: referrer.id,
      referredId: referredUserId,
      referralCode: code.code,
      status: 'pending',
      rewardClaimed: false
    });
    
    // Update user records
    await storage.updateUser(referredUserId, {
      wasReferred: true,
      referredBy: referrer.id
    });
    
    await storage.updateUser(referrer.id, {
      referralCount: (referrer.referralCount || 0) + 1
    });
    
    return true;
  } catch (error) {
    console.error('Error processing referral:', error);
    return false;
  }
}

/**
 * Check if a referred user meets the qualification criteria
 * This would be called after significant actions (completed chats, etc.)
 */
export async function checkReferralQualification(userId: number): Promise<void> {
  try {
    // Find the referral record where this user was referred
    const referral = await storage.getReferralByReferredId(userId);
    if (!referral || referral.status !== 'pending') {
      return;
    }
    
    // Get user metrics to check qualification
    const metrics = await getUserActivityMetrics(userId);
    
    // Check if user meets qualification criteria (e.g., completed 3 chats)
    const REQUIRED_CHATS = 3;
    if (metrics.totalChats >= REQUIRED_CHATS) {
      // Update referral to qualified status
      await storage.updateReferral(referral.id, {
        status: 'qualified'
      });
      
      // Check if referrer can claim rewards
      await checkReferrerRewardEligibility(referral.referrerId);
    }
  } catch (error) {
    console.error('Error checking referral qualification:', error);
  }
}

/**
 * Check if a referrer is eligible for rewards
 */
export async function checkReferrerRewardEligibility(referrerId: number): Promise<void> {
  try {
    // Get qualified referrals for this user
    const qualifiedReferrals = await storage.getQualifiedReferrals(referrerId);
    const qualifiedCount = qualifiedReferrals.length;
    
    // Get available rewards
    const availableRewards = await storage.getActiveReferralRewards();
    
    // Find rewards user is eligible for
    for (const reward of availableRewards) {
      if (qualifiedCount >= reward.requiredReferrals) {
        // Check if user already claimed this reward
        const existing = await storage.getUserReferralReward(referrerId, reward.id);
        if (!existing) {
          // User is eligible for this reward
          await notifyUserOfRewardEligibility(referrerId, reward.id);
        }
      }
    }
  } catch (error) {
    console.error('Error checking reward eligibility:', error);
  }
}

/**
 * Notify user of reward eligibility via a system message
 */
async function notifyUserOfRewardEligibility(userId: number, rewardId: number): Promise<void> {
  try {
    const reward = await storage.getReferralReward(rewardId);
    if (!reward) return;
    
    // Send notification to user (implementation depends on your notification system)
    // For now, we'll assume a sendToUser function exists as in your routes.ts file
    sendToUser(userId, {
      type: 'reward_eligibility',
      rewardId: reward.id,
      name: reward.name,
      description: reward.description
    });
  } catch (error) {
    console.error('Error notifying user of reward:', error);
  }
}

/**
 * Claim a referral reward for a user
 */
export async function claimReferralReward(userId: number, rewardId: number): Promise<boolean> {
  try {
    // Get the reward
    const reward = await storage.getReferralReward(rewardId);
    if (!reward || !reward.isActive) {
      return false;
    }
    
    // Check if user is eligible
    const qualifiedReferrals = await storage.getQualifiedReferrals(userId);
    if (qualifiedReferrals.length < reward.requiredReferrals) {
      return false;
    }
    
    // Check if user already claimed this reward
    const existing = await storage.getUserReferralReward(userId, rewardId);
    if (existing) {
      return false;
    }
    
    // Create user reward record
    const userReward = await storage.createUserReferralReward({
      userId,
      rewardId,
      appliedAt: new Date(),
      expiresAt: calculateRewardExpiry(reward)
    });
    
    // Apply the reward
    await applyReward(userId, reward);
    
    // Update referrals to rewarded status
    // We'll mark as many referrals as needed for this reward as 'rewarded'
    const referralsToReward = qualifiedReferrals
      .filter(r => r.status === 'qualified')
      .slice(0, reward.requiredReferrals);
    
    for (const referral of referralsToReward) {
      await storage.updateReferral(referral.id, {
        status: 'rewarded',
        rewardClaimed: true,
        rewardClaimedAt: new Date()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error claiming reward:', error);
    return false;
  }
}

/**
 * Calculate expiry date for a reward
 */
function calculateRewardExpiry(reward: ReferralReward): Date | undefined {
  if (reward.type === 'premium_days') {
    const days = reward.value?.days as number;
    if (days) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);
      return expiry;
    }
  }
  
  // No expiry for other reward types
  return undefined;
}

/**
 * Apply a reward to a user
 */
async function applyReward(userId: number, reward: ReferralReward): Promise<void> {
  switch (reward.type) {
    case 'premium_days':
      await applyPremiumDaysReward(userId, reward);
      break;
    
    case 'discount':
      await applyDiscountReward(userId, reward);
      break;
    
    case 'badge':
      await applyBadgeReward(userId, reward);
      break;
    
    default:
      console.error(`Unknown reward type: ${reward.type}`);
  }
}

/**
 * Apply premium subscription days to a user
 */
async function applyPremiumDaysReward(userId: number, reward: ReferralReward): Promise<void> {
  const days = reward.value?.days as number;
  if (!days) return;
  
  const user = await storage.getUser(userId);
  if (!user) return;
  
  // Calculate new expiry date
  let expiryDate = new Date();
  
  // If user already has premium, extend from current expiry
  if (user.isPremium && user.premiumUntil) {
    const currentExpiry = new Date(user.premiumUntil);
    // Only use current expiry if it's in the future
    if (currentExpiry > expiryDate) {
      expiryDate = currentExpiry;
    }
  }
  
  // Add days to expiry
  expiryDate.setDate(expiryDate.getDate() + days);
  
  // Update user with premium status
  await storage.updateUser(userId, {
    isPremium: true,
    premiumUntil: expiryDate,
    premiumTier: 'Premium' // Default to Premium tier
  });
  
  // Notify user
  sendToUser(userId, {
    type: 'premium_activated',
    days,
    expiryDate: expiryDate.toISOString()
  });
}

/**
 * Apply discount reward to a user
 */
async function applyDiscountReward(userId: number, reward: ReferralReward): Promise<void> {
  // Implementation would depend on your payment system
  // For now, we'll just notify the user
  
  const percentOff = reward.value?.percent_off as number;
  if (!percentOff) return;
  
  // Create a discount code or store the discount for this user
  // ...
  
  // Notify user
  sendToUser(userId, {
    type: 'discount_awarded',
    percentOff,
    // Include any discount code or instructions
  });
}

/**
 * Apply badge reward to a user
 */
async function applyBadgeReward(userId: number, reward: ReferralReward): Promise<void> {
  const badgeId = reward.value?.badge_id as number;
  if (!badgeId) return;
  
  // Add badge to user's collection
  // This would use your achievement system
  // ...
  
  // Notify user
  sendToUser(userId, {
    type: 'badge_awarded',
    badgeId,
    badgeName: reward.name
  });
}

/**
 * Get user activity metrics for referral qualification
 */
async function getUserActivityMetrics(userId: number): Promise<{ totalChats: number }> {
  // Get interaction metrics
  const metrics = await storage.getUserInteractionMetrics(userId);
  
  return {
    totalChats: metrics?.totalChats || 0
  };
}

/**
 * Generate a referral link for a user
 */
export function generateReferralLink(code: string, baseUrl: string): string {
  return `${baseUrl}/signup?ref=${code}`;
}
```

### 2.2 Storage Interface Updates

Extend the storage interface for referral-related operations:

```typescript
// server/storage.ts - extend IStorage interface

export interface IStorage {
  // Existing methods...
  
  // Referral Codes
  getUserReferralCode(userId: number): Promise<ReferralCode | undefined>;
  getReferralCodeByCode(code: string): Promise<ReferralCode | undefined>;
  createReferralCode(code: InsertReferralCode): Promise<ReferralCode>;
  deactivateReferralCode(userId: number): Promise<ReferralCode | undefined>;
  
  // Referrals
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralByReferredId(referredId: number): Promise<Referral | undefined>;
  updateReferral(id: number, updates: Partial<Referral>): Promise<Referral | undefined>;
  getUserReferrals(referrerId: number): Promise<Referral[]>;
  getQualifiedReferrals(referrerId: number): Promise<Referral[]>;
  
  // Referral Rewards
  getActiveReferralRewards(): Promise<ReferralReward[]>;
  getReferralReward(id: number): Promise<ReferralReward | undefined>;
  createReferralReward(reward: InsertReferralReward): Promise<ReferralReward>;
  updateReferralReward(id: number, updates: Partial<ReferralReward>): Promise<ReferralReward | undefined>;
  
  // User Referral Rewards
  getUserReferralReward(userId: number, rewardId: number): Promise<UserReferralReward | undefined>;
  getUserReferralRewards(userId: number): Promise<(UserReferralReward & ReferralReward)[]>;
  createUserReferralReward(userReward: InsertUserReferralReward): Promise<UserReferralReward>;
}

// Implementation in DatabaseStorage class
export class DatabaseStorage implements IStorage {
  // Existing methods...
  
  // Referral Codes
  async getUserReferralCode(userId: number): Promise<ReferralCode | undefined> {
    const [code] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId));
    return code;
  }
  
  async getReferralCodeByCode(code: string): Promise<ReferralCode | undefined> {
    const [result] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code));
    return result;
  }
  
  async createReferralCode(code: InsertReferralCode): Promise<ReferralCode> {
    const [result] = await db
      .insert(referralCodes)
      .values(code)
      .returning();
    return result;
  }
  
  async deactivateReferralCode(userId: number): Promise<ReferralCode | undefined> {
    const [result] = await db
      .update(referralCodes)
      .set({ isActive: false })
      .where(eq(referralCodes.userId, userId))
      .returning();
    return result;
  }
  
  // Referrals
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [result] = await db
      .insert(referrals)
      .values(referral)
      .returning();
    return result;
  }
  
  async getReferralByReferredId(referredId: number): Promise<Referral | undefined> {
    const [result] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referredId, referredId));
    return result;
  }
  
  async updateReferral(id: number, updates: Partial<Referral>): Promise<Referral | undefined> {
    const [result] = await db
      .update(referrals)
      .set(updates)
      .where(eq(referrals.id, id))
      .returning();
    return result;
  }
  
  async getUserReferrals(referrerId: number): Promise<Referral[]> {
    return db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, referrerId));
  }
  
  async getQualifiedReferrals(referrerId: number): Promise<Referral[]> {
    return db
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referrerId, referrerId),
          eq(referrals.status, 'qualified')
        )
      );
  }
  
  // Referral Rewards
  async getActiveReferralRewards(): Promise<ReferralReward[]> {
    return db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.isActive, true))
      .orderBy(referralRewards.requiredReferrals);
  }
  
  async getReferralReward(id: number): Promise<ReferralReward | undefined> {
    const [result] = await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.id, id));
    return result;
  }
  
  async createReferralReward(reward: InsertReferralReward): Promise<ReferralReward> {
    const [result] = await db
      .insert(referralRewards)
      .values(reward)
      .returning();
    return result;
  }
  
  async updateReferralReward(id: number, updates: Partial<ReferralReward>): Promise<ReferralReward | undefined> {
    const [result] = await db
      .update(referralRewards)
      .set(updates)
      .where(eq(referralRewards.id, id))
      .returning();
    return result;
  }
  
  // User Referral Rewards
  async getUserReferralReward(userId: number, rewardId: number): Promise<UserReferralReward | undefined> {
    const [result] = await db
      .select()
      .from(userReferralRewards)
      .where(
        and(
          eq(userReferralRewards.userId, userId),
          eq(userReferralRewards.rewardId, rewardId)
        )
      );
    return result;
  }
  
  async getUserReferralRewards(userId: number): Promise<(UserReferralReward & ReferralReward)[]> {
    return db
      .select({
        id: userReferralRewards.id,
        userId: userReferralRewards.userId,
        rewardId: userReferralRewards.rewardId,
        claimedAt: userReferralRewards.claimedAt,
        appliedAt: userReferralRewards.appliedAt,
        expiresAt: userReferralRewards.expiresAt,
        name: referralRewards.name,
        description: referralRewards.description,
        type: referralRewards.type,
        value: referralRewards.value,
        requiredReferrals: referralRewards.requiredReferrals,
      })
      .from(userReferralRewards)
      .innerJoin(referralRewards, eq(userReferralRewards.rewardId, referralRewards.id))
      .where(eq(userReferralRewards.userId, userId));
  }
  
  async createUserReferralReward(userReward: InsertUserReferralReward): Promise<UserReferralReward> {
    const [result] = await db
      .insert(userReferralRewards)
      .values(userReward)
      .returning();
    return result;
  }
}
```

## 3. API Endpoints

Now, let's implement the API endpoints for the referral system:

```typescript
// server/routes.ts - inside registerRoutes function

// Get user's referral code
app.get('/api/referrals/code', async (req, res) => {
  try {
    // User must be authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = getUserIdFromRequest(req);
    
    // Get or create referral code
    const code = await getUserReferralCode(userId);
    
    // Generate referral link
    const baseUrl = process.env.BASE_URL || `https://${req.headers.host}`;
    const referralLink = generateReferralLink(code, baseUrl);
    
    res.json({
      code,
      referralLink
    });
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Process referral during signup
app.post('/api/auth/signup-with-referral', async (req, res) => {
  try {
    const { username, password, referralCode } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create user
    const user = await storage.createUser({
      username,
      password,
      uid: generateUid(), // Implement this function
      isAdmin: false,
    });
    
    // Process referral if provided
    if (referralCode) {
      await processReferral(user.id, referralCode);
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Get user's referrals
app.get('/api/referrals', async (req, res) => {
  try {
    // User must be authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = getUserIdFromRequest(req);
    
    // Get referrals made by the user
    const referrals = await storage.getUserReferrals(userId);
    
    // Get qualified referrals count and total referrals count
    const qualifiedCount = referrals.filter(r => r.status === 'qualified' || r.status === 'rewarded').length;
    
    // Get available rewards
    const rewards = await storage.getActiveReferralRewards();
    
    // Get user's claimed rewards
    const userRewards = await storage.getUserReferralRewards(userId);
    
    res.json({
      referrals,
      stats: {
        totalReferrals: referrals.length,
        qualifiedReferrals: qualifiedCount,
        rewardedReferrals: referrals.filter(r => r.status === 'rewarded').length
      },
      availableRewards: rewards,
      claimedRewards: userRewards
    });
  } catch (error) {
    console.error('Error getting referrals:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Claim a referral reward
app.post('/api/referrals/claim-reward/:rewardId', async (req, res) => {
  try {
    // User must be authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = getUserIdFromRequest(req);
    const rewardId = parseInt(req.params.rewardId, 10);
    
    if (isNaN(rewardId)) {
      return res.status(400).json({ error: 'Invalid reward ID' });
    }
    
    // Claim the reward
    const success = await claimReferralReward(userId, rewardId);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to claim reward' });
    }
    
    // Get updated rewards
    const userRewards = await storage.getUserReferralRewards(userId);
    
    res.json({
      success: true,
      claimedRewards: userRewards
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

## 4. Create Referral Rewards

We need to seed the database with initial referral reward options:

```typescript
// server/seed-referral-rewards.ts

import { storage } from './storage';

async function seedReferralRewards() {
  try {
    // Check if rewards already exist
    const existingRewards = await storage.getActiveReferralRewards();
    
    if (existingRewards.length > 0) {
      console.log('Referral rewards already exist, skipping seed');
      return;
    }
    
    // Create reward records
    const rewards = [
      {
        name: '1 Week Premium',
        description: 'Enjoy 7 days of Premium features for referring a friend',
        type: 'premium_days',
        value: { days: 7 },
        requiredReferrals: 1,
        isActive: true
      },
      {
        name: '1 Month Premium',
        description: 'Enjoy 30 days of Premium features for referring 3 friends',
        type: 'premium_days',
        value: { days: 30 },
        requiredReferrals: 3,
        isActive: true
      },
      {
        name: '3 Months Premium',
        description: 'Enjoy 90 days of Premium features for referring 7 friends',
        type: 'premium_days',
        value: { days: 90 },
        requiredReferrals: 7,
        isActive: true
      },
      {
        name: '20% Discount',
        description: 'Get 20% off your next subscription purchase',
        type: 'discount',
        value: { percent_off: 20 },
        requiredReferrals: 2,
        isActive: true
      },
      {
        name: 'Referral Champion Badge',
        description: 'Earn an exclusive badge for referring 5 friends',
        type: 'badge',
        value: { badge_id: 101 }, // This would correspond to a badge in your achievement system
        requiredReferrals: 5,
        isActive: true
      }
    ];
    
    // Insert rewards
    for (const reward of rewards) {
      await storage.createReferralReward(reward);
    }
    
    console.log('Referral rewards seeded successfully');
  } catch (error) {
    console.error('Error seeding referral rewards:', error);
  }
}

// Run this once during app initialization
// seedReferralRewards();
```

## 5. Client-Side Implementation

### 5.1 Referral Page Component

Create a component for the referral page:

```tsx
// client/src/pages/Referrals.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toast } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, Check, Users, Award, Gift } from 'lucide-react';

export default function ReferralsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  
  // Get user's referral code and link
  const { data: referralData, isLoading: loadingReferral } = useQuery({
    queryKey: ['/api/referrals/code'],
  });
  
  // Get user's referrals and rewards
  const { data: referralsData, isLoading: loadingReferrals } = useQuery({
    queryKey: ['/api/referrals'],
  });
  
  // Claim reward mutation
  const claimRewardMutation = useMutation({
    mutationFn: (rewardId: number) => 
      apiRequest('POST', `/api/referrals/claim-reward/${rewardId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
      toast({
        title: 'Reward Claimed!',
        description: 'Your referral reward has been successfully claimed.',
      });
    },
    onError: () => {
      toast({
        title: 'Claim Failed',
        description: 'Unable to claim reward. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Copy referral link to clipboard
  const copyReferralLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Share referral link
  const shareReferralLink = () => {
    if (navigator.share && referralData?.referralLink) {
      navigator.share({
        title: 'Join me on StrangerWave',
        text: 'Check out StrangerWave - an awesome platform to meet new people and make connections. Use my referral link to sign up!',
        url: referralData.referralLink
      }).catch(error => {
        console.error('Error sharing:', error);
      });
    } else {
      copyReferralLink();
    }
  };
  
  // Handle reward claim
  const handleClaimReward = (rewardId: number) => {
    claimRewardMutation.mutate(rewardId);
  };
  
  if (loadingReferral || loadingReferrals) {
    return <div>Loading referral data...</div>;
  }
  
  const { referrals, stats, availableRewards, claimedRewards } = referralsData || {
    referrals: [],
    stats: { totalReferrals: 0, qualifiedReferrals: 0, rewardedReferrals: 0 },
    availableRewards: [],
    claimedRewards: []
  };
  
  // Create a set of claimed reward IDs for easy lookup
  const claimedRewardIds = new Set(claimedRewards?.map(reward => reward.rewardId) || []);
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Refer Friends & Earn Rewards</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalReferrals || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-500" />
              Qualified Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.qualifiedReferrals || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="h-5 w-5 mr-2 text-purple-500" />
              Rewards Claimed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{claimedRewards?.length || 0}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-primary/5 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
        <p className="text-muted-foreground mb-4">
          Share this link with friends to invite them to StrangerWave. You'll earn rewards for each friend who signs up and meets the qualification criteria.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <div className="flex-grow">
            <Input 
              value={referralData?.referralLink || ''} 
              readOnly 
              className="h-10"
            />
          </div>
          <Button 
            onClick={copyReferralLink} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button 
            onClick={shareReferralLink} 
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Referral Code: <span className="font-medium">{referralData?.code}</span>
        </p>
      </div>
      
      <Tabs defaultValue="available-rewards">
        <TabsList className="mb-6">
          <TabsTrigger value="available-rewards">Available Rewards</TabsTrigger>
          <TabsTrigger value="claimed-rewards">Claimed Rewards</TabsTrigger>
          <TabsTrigger value="referral-history">Referral History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available-rewards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRewards?.map(reward => {
              const isEligible = stats?.qualifiedReferrals >= reward.requiredReferrals;
              const isClaimed = claimedRewardIds.has(reward.id);
              
              return (
                <Card key={reward.id} className={`relative overflow-hidden ${isClaimed ? 'opacity-70' : ''}`}>
                  {isClaimed && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                      <div className="bg-green-500 text-white px-4 py-2 rounded-full font-medium">
                        Already Claimed
                      </div>
                    </div>
                  )}
                  <div className="h-2 bg-primary" />
                  <CardHeader className="pb-2">
                    <CardTitle>{reward.name}</CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Label className="text-xs text-muted-foreground">Required Referrals</Label>
                      <div className="text-lg font-bold">
                        {reward.requiredReferrals} 
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          ({stats?.qualifiedReferrals || 0}/{reward.requiredReferrals})
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      disabled={!isEligible || isClaimed || claimRewardMutation.isPending}
                      onClick={() => handleClaimReward(reward.id)}
                    >
                      {claimRewardMutation.isPending ? 'Claiming...' : 
                       isClaimed ? 'Claimed' : 
                       isEligible ? 'Claim Reward' : 'Not Eligible Yet'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="claimed-rewards">
          {claimedRewards?.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No Rewards Claimed Yet</h3>
              <p className="text-muted-foreground">
                Start referring friends to earn rewards
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {claimedRewards?.map(reward => (
                <Card key={reward.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{reward.name}</CardTitle>
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Claimed On</Label>
                        <div className="font-medium">
                          {new Date(reward.claimedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {reward.expiresAt && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Expires On</Label>
                          <div className="font-medium">
                            {new Date(reward.expiresAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="referral-history">
          {referrals?.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No Referrals Yet</h3>
              <p className="text-muted-foreground">
                Share your referral link to start inviting friends
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals?.map(referral => (
                    <tr key={referral.id} className="border-b">
                      <td className="p-3">User #{referral.referredId}</td>
                      <td className="p-3">{new Date(referral.referredAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        {referral.status === 'pending' && (
                          <span className="text-yellow-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                            Pending
                          </span>
                        )}
                        {referral.status === 'qualified' && (
                          <span className="text-green-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                            Qualified
                          </span>
                        )}
                        {referral.status === 'rewarded' && (
                          <span className="text-purple-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                            Rewarded
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {referral.status === 'rewarded' ? (
                          <span className="text-green-500">
                            <Check className="h-4 w-4 inline mr-1" />
                            Claimed
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 5.2 Update Registration Form

Modify the registration form to accept referral codes:

```tsx
// client/src/components/auth/SignupForm.tsx

import React from 'react';
import { useSearchParams } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/useAuth';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  referralCode: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { toast } = useToast();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const referralCodeFromUrl = searchParams.get('ref') || '';
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      password: '',
      referralCode: referralCodeFromUrl
    }
  });
  
  const signupMutation = useMutation({
    mutationFn: (data: SignupFormValues) => 
      apiRequest('POST', '/api/auth/signup-with-referral', data),
    onSuccess: (data) => {
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully',
      });
      
      // Log in the user
      login(data.token);
    },
    onError: (error: any) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to create your account',
        variant: 'destructive'
      });
    }
  });
  
  const onSubmit = (data: SignupFormValues) => {
    signupMutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Choose a username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Create a password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="referralCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referral Code (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter referral code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={signupMutation.isPending}
        >
          {signupMutation.isPending ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
    </Form>
  );
}
```

### 5.3 Update Navigation to Include Referrals Page

Add a link to the referrals page in the app navigation:

```tsx
// client/src/components/layout/Navigation.tsx

// Somewhere in your navigation component
<Link href="/referrals">
  <Button variant="ghost" className="flex items-center gap-2">
    <Users className="h-5 w-5" />
    <span>Refer & Earn</span>
  </Button>
</Link>
```

## 6. Implementation Plan and Timeline

### Phase 1: Backend Development (Week 1)

1. **Day 1-2**: Database schema updates
   - Create referral-related tables
   - Update users table with referral fields
   - Implement storage interface methods

2. **Day 3-4**: Referral services implementation
   - Create referral code generation
   - Implement referral processing
   - Develop reward qualification checking

3. **Day 5**: API endpoints and testing
   - Create referral-related API endpoints
   - Set up reward claiming functionality
   - Test the referral flow end-to-end

### Phase 2: Frontend Development (Week 2)

1. **Day 1-2**: Referral management page
   - Create referral display component
   - Implement code copying/sharing
   - Build reward claiming UI

2. **Day 3-4**: Registration integration
   - Update registration flow to accept referral codes
   - Add referral link to shareable content
   - Implement referral status tracking

3. **Day 5**: Testing and optimization
   - Test referral process from end to end
   - Optimize user experience
   - Add analytics tracking for referrals

## 7. Potential Challenges and Mitigations

### Fraud Prevention

**Challenge**: Users might try to create multiple accounts to claim their own referral rewards.

**Mitigation**:
- Implement IP tracking to detect suspicious activity
- Require additional verification for referred accounts before they qualify
- Set qualification criteria that are harder to fake (e.g., completing real chats)
- Monitor for patterns of abuse and adjust criteria as needed

### Technical Limitations

**Challenge**: Complex reward distribution logic could lead to inconsistencies.

**Mitigation**:
- Use database transactions to ensure atomicity when claiming rewards
- Implement thorough logging and monitoring for reward disbursement
- Create admin tools to manually fix issues if they arise
- Regular audits of the referral system

### User Experience

**Challenge**: Users might not understand how to use the referral system or when they qualify for rewards.

**Mitigation**:
- Create clear, intuitive UI with explicit instructions
- Show progress towards qualification criteria
- Send notifications when referred users make progress
- Provide transparent status updates on all referrals

## 8. Future Enhancements

1. **Tiered Referral Program**: Implementing different reward tiers for more active referrers
2. **Seasonal Campaigns**: Special limited-time referral bonuses
3. **Social Media Integration**: Direct sharing to social platforms
4. **Referral Analytics**: Detailed dashboard for tracking referral performance
5. **Custom Referral Messages**: Allow users to personalize invitation messages