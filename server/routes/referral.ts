import { Router } from 'express';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';
import { 
  insertReferralCodeSchema, 
  insertReferralSchema, 
  insertUserReferralRewardSchema 
} from '@shared/schema';
import { z } from 'zod';

const router = Router();

/**
 * Generate a unique referral code for a user
 */
router.post('/codes', async (req, res) => {
  try {
    const validationSchema = z.object({
      userId: z.number(),
      isCreatorCode: z.boolean().optional(),
      bonusPercentage: z.number().optional()
    });
    
    const { userId, isCreatorCode, bonusPercentage } = validationSchema.parse(req.body);
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user already has a referral code
    const existingCode = await storage.getUserReferralCode(userId);
    if (existingCode) {
      // Return existing code if it's still active
      if (existingCode.isActive) {
        return res.json(existingCode);
      }
      
      // If code exists but is inactive, deactivate it first
      await storage.deactivateReferralCode(userId);
    }
    
    // Generate a unique code
    const code = uuidv4().substring(0, 8).toUpperCase();
    
    // Create a new referral code
    const referralCode = await storage.createReferralCode({
      userId,
      code,
      isActive: true,
      isCreatorCode: isCreatorCode || false,
      bonusPercentage: bonusPercentage || 0
    });
    
    res.json(referralCode);
  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(400).json({ error: 'Failed to generate referral code' });
  }
});

/**
 * Get a user's referral code
 */
router.get('/codes/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const referralCode = await storage.getUserReferralCode(userId);
    if (!referralCode) {
      return res.status(404).json({ error: 'No referral code found for this user' });
    }
    
    res.json(referralCode);
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ error: 'Failed to get referral code' });
  }
});

/**
 * Get referral code details by code
 */
router.get('/codes/:code', async (req, res) => {
  try {
    const code = req.params.code;
    
    const referralCode = await storage.getReferralCodeByCode(code);
    if (!referralCode) {
      return res.status(404).json({ error: 'Referral code not found' });
    }
    
    if (!referralCode.isActive) {
      return res.status(400).json({ error: 'This referral code is no longer active' });
    }
    
    res.json(referralCode);
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ error: 'Failed to get referral code' });
  }
});

/**
 * Apply a referral when user registers with a code
 */
router.post('/apply', async (req, res) => {
  try {
    const validationSchema = z.object({
      referralCode: z.string(),
      referredUserId: z.number()
    });
    
    const { referralCode, referredUserId } = validationSchema.parse(req.body);
    
    // Check if referred user exists
    const referredUser = await storage.getUser(referredUserId);
    if (!referredUser) {
      return res.status(404).json({ error: 'Referred user not found' });
    }
    
    // Check if user has already been referred
    const existingReferral = await storage.getReferralByReferredId(referredUserId);
    if (existingReferral) {
      return res.status(400).json({ error: 'User has already been referred' });
    }
    
    // Get referral code details
    const codeDetails = await storage.getReferralCodeByCode(referralCode);
    if (!codeDetails) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }
    
    if (!codeDetails.isActive) {
      return res.status(400).json({ error: 'This referral code is no longer active' });
    }
    
    // Get referrer
    const referrer = await storage.getUser(codeDetails.userId);
    if (!referrer) {
      return res.status(404).json({ error: 'Referrer not found' });
    }
    
    // Create referral record
    const referral = await storage.createReferral({
      referrerId: referrer.id,
      referredId: referredUserId,
      referralCode: codeDetails.code,
      status: 'pending',
      rewardClaimed: false
    });
    
    // Update referred user to mark as referred
    await storage.updateUser(referredUserId, { 
      wasReferred: true,
      referredBy: referrer.id
    });
    
    // Increment referrer's referral count
    await storage.updateUser(referrer.id, { 
      referralCount: (referrer.referralCount || 0) + 1 
    });
    
    res.json(referral);
  } catch (error) {
    console.error('Error applying referral:', error);
    res.status(400).json({ error: 'Failed to apply referral' });
  }
});

/**
 * Get all available referral rewards
 */
router.get('/rewards', async (req, res) => {
  try {
    const rewards = await storage.getActiveReferralRewards();
    res.json(rewards);
  } catch (error) {
    console.error('Error getting referral rewards:', error);
    res.status(500).json({ error: 'Failed to get referral rewards' });
  }
});

/**
 * Get a user's referral rewards
 */
router.get('/rewards/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const rewards = await storage.getUserReferralRewards(userId);
    res.json(rewards);
  } catch (error) {
    console.error('Error getting user referral rewards:', error);
    res.status(500).json({ error: 'Failed to get user referral rewards' });
  }
});

/**
 * Claim a referral reward
 */
router.post('/rewards/claim', async (req, res) => {
  try {
    const validationSchema = z.object({
      userId: z.number(),
      rewardId: z.number()
    });
    
    const { userId, rewardId } = validationSchema.parse(req.body);
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if reward exists
    const reward = await storage.getReferralReward(rewardId);
    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    
    if (!reward.isActive) {
      return res.status(400).json({ error: 'This reward is no longer active' });
    }
    
    // Check if user has enough referrals
    const qualifiedReferrals = await storage.getQualifiedReferrals(userId);
    if (qualifiedReferrals.length < reward.requiredReferrals) {
      return res.status(400).json({ 
        error: `Not enough qualified referrals. You need ${reward.requiredReferrals} but have ${qualifiedReferrals.length}.`
      });
    }
    
    // Check if user has already claimed this reward
    const existingReward = await storage.getUserReferralReward(userId, rewardId);
    if (existingReward) {
      return res.status(400).json({ error: 'You have already claimed this reward' });
    }
    
    // Apply reward based on type
    let expiresAt: Date | undefined;
    
    if (reward.type === 'premium_days') {
      const days = (reward.value as any).days || 0;
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
      
      // Activate premium
      await storage.activatePremium(userId, 'referral', expiresAt);
    } else if (reward.type === 'tokens') {
      const tokens = (reward.value as any).tokens || 0;
      
      // Add tokens to user balance
      const currentTokens = user.tokens || 0;
      await storage.updateUser(userId, { tokens: currentTokens + tokens });
    }
    
    // Create user reward record
    const userReward = await storage.createUserReferralReward({
      userId,
      rewardId,
      appliedAt: new Date(),
      expiresAt
    });
    
    res.json(userReward);
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(400).json({ error: 'Failed to claim reward' });
  }
});

/**
 * Get a user's referrals
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const referrals = await storage.getUserReferrals(userId);
    
    // Get details for each referred user
    const referralsWithDetails = await Promise.all(
      referrals.map(async (referral) => {
        const user = await storage.getUser(referral.referredId);
        return {
          ...referral,
          referredUser: user ? {
            id: user.id,
            username: user.username
          } : null
        };
      })
    );
    
    res.json(referralsWithDetails);
  } catch (error) {
    console.error('Error getting user referrals:', error);
    res.status(500).json({ error: 'Failed to get user referrals' });
  }
});

/**
 * Get referral leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    // Get top referrers
    const topReferrers = await storage.getTopReferrers(10);
    res.json(topReferrers);
  } catch (error) {
    console.error('Error getting referral leaderboard:', error);
    res.status(500).json({ error: 'Failed to get referral leaderboard' });
  }
});

export default router;