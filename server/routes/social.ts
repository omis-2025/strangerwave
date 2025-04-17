import { Router } from 'express';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';
import { insertSocialShareSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

/**
 * Create a new social share
 */
router.post('/share', async (req, res) => {
  try {
    const validationSchema = z.object({
      userId: z.number(),
      sessionId: z.number().optional(),
      type: z.string(),
      content: z.string().optional(),
      mediaUrl: z.string().optional(),
      platform: z.string().optional()
    });
    
    const shareData = validationSchema.parse(req.body);
    
    // Check if user exists
    const user = await storage.getUser(shareData.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate a unique tracking URL
    const uniqueId = uuidv4().substring(0, 8);
    const shareUrl = `${process.env.APP_URL || 'https://strangerwave.chat'}/share/${uniqueId}`;
    
    // Create share record
    const share = await storage.createSocialShare({
      ...shareData,
      shareUrl
    });
    
    // Award tokens to user for sharing (if enabled)
    if (user.tokens !== undefined) {
      const sharingBonus = 5; // 5 tokens per share
      await storage.updateUser(shareData.userId, {
        tokens: user.tokens + sharingBonus
      });
    }
    
    res.json(share);
  } catch (error) {
    console.error('Error creating social share:', error);
    res.status(400).json({ error: 'Failed to create social share' });
  }
});

/**
 * Track click on a social share link
 */
router.post('/share/click/:shareId', async (req, res) => {
  try {
    const shareId = parseInt(req.params.shareId);
    if (isNaN(shareId)) {
      return res.status(400).json({ error: 'Invalid share ID' });
    }
    
    // Increment click count
    const updatedShare = await storage.incrementShareClicks(shareId);
    if (!updatedShare) {
      return res.status(404).json({ error: 'Share not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking share click:', error);
    res.status(500).json({ error: 'Failed to track share click' });
  }
});

/**
 * Track conversion from a social share link
 */
router.post('/share/convert/:shareId', async (req, res) => {
  try {
    const shareId = parseInt(req.params.shareId);
    if (isNaN(shareId)) {
      return res.status(400).json({ error: 'Invalid share ID' });
    }
    
    // Increment conversion count
    const updatedShare = await storage.incrementShareConversions(shareId);
    if (!updatedShare) {
      return res.status(404).json({ error: 'Share not found' });
    }
    
    // Get the user who shared to award them bonus for conversion
    const share = await storage.getSocialShare(shareId);
    if (share) {
      const user = await storage.getUser(share.userId);
      if (user && user.tokens !== undefined) {
        const conversionBonus = 25; // 25 tokens per conversion
        await storage.updateUser(share.userId, {
          tokens: user.tokens + conversionBonus
        });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking share conversion:', error);
    res.status(500).json({ error: 'Failed to track share conversion' });
  }
});

/**
 * Get user's shares
 */
router.get('/user/:userId/shares', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const shares = await storage.getUserSocialShares(userId);
    res.json(shares);
  } catch (error) {
    console.error('Error getting user shares:', error);
    res.status(500).json({ error: 'Failed to get user shares' });
  }
});

export default router;