import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertPrivateRoomSchema } from '@shared/schema';

const router = Router();

/**
 * Enable creator mode for a user
 */
router.post('/enable', async (req, res) => {
  try {
    const validationSchema = z.object({
      userId: z.number(),
      bio: z.string().optional(),
      settings: z.object({
        tippingEnabled: z.boolean().optional(),
        privateRoomRate: z.number().optional(),
        contentCategories: z.array(z.string()).optional()
      }).optional()
    });
    
    const { userId, bio, settings } = validationSchema.parse(req.body);
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has premium subscription (requirement for creator mode)
    const subscription = await storage.getUserSubscriptionStatus(userId);
    if (!subscription.isActive) {
      return res.status(403).json({ error: 'Premium subscription required for creator mode' });
    }
    
    // Update user profile with creator settings
    const updatedUser = await storage.updateUser(userId, {
      isCreator: true,
      creatorBio: bio || null,
      creatorSettings: settings || {
        tippingEnabled: true,
        privateRoomRate: 10, // Default: 10 tokens per minute
        contentCategories: []
      }
    });
    
    // Create a special referral code for the creator
    const existingCode = await storage.getUserReferralCode(userId);
    if (!existingCode || !existingCode.isCreatorCode) {
      // Generate creator-specific referral code
      await storage.createReferralCode({
        userId,
        code: `CR${user.username.substring(0, 6).toUpperCase()}`,
        isActive: true,
        isCreatorCode: true,
        bonusPercentage: 20 // Creators get 20% bonus on referrals
      });
    }
    
    res.json({
      success: true,
      user: {
        id: updatedUser?.id,
        username: updatedUser?.username,
        isCreator: updatedUser?.isCreator,
        creatorBio: updatedUser?.creatorBio,
        creatorSettings: updatedUser?.creatorSettings
      }
    });
  } catch (error) {
    console.error('Error enabling creator mode:', error);
    res.status(400).json({ error: 'Failed to enable creator mode' });
  }
});

/**
 * Disable creator mode for a user
 */
router.post('/disable', async (req, res) => {
  try {
    const { userId } = z.object({
      userId: z.number()
    }).parse(req.body);
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.isCreator) {
      return res.status(400).json({ error: 'User is not in creator mode' });
    }
    
    // Update user profile to disable creator mode
    const updatedUser = await storage.updateUser(userId, {
      isCreator: false,
      creatorSettings: null
    });
    
    // Deactivate creator referral code
    await storage.deactivateReferralCode(userId);
    
    res.json({ 
      success: true,
      user: {
        id: updatedUser?.id,
        username: updatedUser?.username,
        isCreator: updatedUser?.isCreator
      }
    });
  } catch (error) {
    console.error('Error disabling creator mode:', error);
    res.status(400).json({ error: 'Failed to disable creator mode' });
  }
});

/**
 * Update creator profile
 */
router.put('/profile', async (req, res) => {
  try {
    const validationSchema = z.object({
      userId: z.number(),
      bio: z.string().optional(),
      settings: z.object({
        tippingEnabled: z.boolean().optional(),
        privateRoomRate: z.number().optional(),
        contentCategories: z.array(z.string()).optional()
      }).optional()
    });
    
    const { userId, bio, settings } = validationSchema.parse(req.body);
    
    // Check if user exists and is a creator
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.isCreator) {
      return res.status(400).json({ error: 'User is not in creator mode' });
    }
    
    // Update fields that were provided
    const updates: any = {};
    if (bio !== undefined) updates.creatorBio = bio;
    if (settings !== undefined) {
      // Merge with existing settings
      const currentSettings = user.creatorSettings || {
        tippingEnabled: true,
        privateRoomRate: 10,
        contentCategories: []
      };
      
      updates.creatorSettings = {
        ...currentSettings,
        ...settings
      };
    }
    
    const updatedUser = await storage.updateUser(userId, updates);
    
    res.json({
      success: true,
      user: {
        id: updatedUser?.id,
        username: updatedUser?.username,
        isCreator: updatedUser?.isCreator,
        creatorBio: updatedUser?.creatorBio,
        creatorSettings: updatedUser?.creatorSettings
      }
    });
  } catch (error) {
    console.error('Error updating creator profile:', error);
    res.status(400).json({ error: 'Failed to update creator profile' });
  }
});

/**
 * Get all active creators
 */
router.get('/list', async (req, res) => {
  try {
    const creators = await storage.getCreators();
    
    // Format response to include only necessary fields
    const formattedCreators = creators.map(creator => ({
      id: creator.id,
      username: creator.username,
      bio: creator.creatorBio,
      settings: creator.creatorSettings,
      // Include only safe fields
    }));
    
    res.json(formattedCreators);
  } catch (error) {
    console.error('Error getting creators:', error);
    res.status(500).json({ error: 'Failed to get creators' });
  }
});

/**
 * Get creator profile by ID
 */
router.get('/:creatorId', async (req, res) => {
  try {
    const creatorId = parseInt(req.params.creatorId);
    if (isNaN(creatorId)) {
      return res.status(400).json({ error: 'Invalid creator ID' });
    }
    
    const creator = await storage.getUser(creatorId);
    if (!creator || !creator.isCreator) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    
    // Return formatted creator profile
    res.json({
      id: creator.id,
      username: creator.username,
      bio: creator.creatorBio,
      settings: {
        tippingEnabled: creator.creatorSettings?.tippingEnabled,
        privateRoomRate: creator.creatorSettings?.privateRoomRate,
        contentCategories: creator.creatorSettings?.contentCategories
      }
    });
  } catch (error) {
    console.error('Error getting creator profile:', error);
    res.status(500).json({ error: 'Failed to get creator profile' });
  }
});

/**
 * Request a private room with a creator
 */
router.post('/private-room/request', async (req, res) => {
  try {
    const validationSchema = z.object({
      userId: z.number(),
      creatorId: z.number(),
    });
    
    const { userId, creatorId } = validationSchema.parse(req.body);
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if creator exists and is in creator mode
    const creator = await storage.getUser(creatorId);
    if (!creator || !creator.isCreator) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    
    // Check creator settings
    if (!creator.creatorSettings || creator.creatorSettings.privateRoomRate <= 0) {
      return res.status(400).json({ error: 'Creator does not accept private rooms' });
    }
    
    // Check if user has enough tokens
    const tokenRate = creator.creatorSettings.privateRoomRate;
    if ((user.tokens || 0) < tokenRate) {
      return res.status(400).json({ 
        error: `Not enough tokens. You need at least ${tokenRate} tokens to start a private room.` 
      });
    }
    
    // Create a private room request
    const privateRoom = await storage.createPrivateRoom({
      creatorId,
      userId,
      tokenRate,
      status: 'pending'
    });
    
    res.json(privateRoom);
  } catch (error) {
    console.error('Error requesting private room:', error);
    res.status(400).json({ error: 'Failed to request private room' });
  }
});

/**
 * Accept a private room request
 */
router.post('/private-room/:roomId/accept', async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    if (isNaN(roomId)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    
    const { creatorId } = z.object({
      creatorId: z.number()
    }).parse(req.body);
    
    // Get room details
    const room = await storage.getPrivateRoom(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Private room not found' });
    }
    
    // Verify creator identity
    if (room.creatorId !== creatorId) {
      return res.status(403).json({ error: 'Not authorized to accept this room' });
    }
    
    if (room.status !== 'pending') {
      return res.status(400).json({ error: `Room is already ${room.status}` });
    }
    
    // Update room status
    const updatedRoom = await storage.updatePrivateRoom(roomId, {
      status: 'active',
      startedAt: new Date()
    });
    
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error accepting private room:', error);
    res.status(400).json({ error: 'Failed to accept private room' });
  }
});

/**
 * End a private room session
 */
router.post('/private-room/:roomId/end', async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    if (isNaN(roomId)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    
    // Get room details
    const room = await storage.getPrivateRoom(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Private room not found' });
    }
    
    if (room.status !== 'active') {
      return res.status(400).json({ error: `Room is not active (current status: ${room.status})` });
    }
    
    // Calculate duration in minutes
    const startTime = room.startedAt ? new Date(room.startedAt) : new Date();
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    
    // Calculate tokens spent
    const tokensSpent = durationMinutes * room.tokenRate;
    
    // Update room status
    const updatedRoom = await storage.updatePrivateRoom(roomId, {
      status: 'completed',
      endedAt: endTime,
      minutesActive: durationMinutes,
      tokensSpent
    });
    
    // Deduct tokens from user
    const user = await storage.getUser(room.userId);
    if (user && user.tokens !== undefined) {
      const newBalance = Math.max(0, user.tokens - tokensSpent);
      await storage.updateUser(room.userId, { tokens: newBalance });
    }
    
    // Add tokens to creator
    const creator = await storage.getUser(room.creatorId);
    if (creator && creator.tokens !== undefined) {
      // Creator receives 70% of tokens
      const creatorShare = Math.floor(tokensSpent * 0.7);
      await storage.updateUser(room.creatorId, { 
        tokens: creator.tokens + creatorShare 
      });
    }
    
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error ending private room:', error);
    res.status(400).json({ error: 'Failed to end private room' });
  }
});

/**
 * Get private rooms for a user
 */
router.get('/private-room/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const rooms = await storage.getUserPrivateRooms(userId);
    res.json(rooms);
  } catch (error) {
    console.error('Error getting user private rooms:', error);
    res.status(500).json({ error: 'Failed to get user private rooms' });
  }
});

/**
 * Get private rooms for a creator
 */
router.get('/private-room/creator/:creatorId', async (req, res) => {
  try {
    const creatorId = parseInt(req.params.creatorId);
    if (isNaN(creatorId)) {
      return res.status(400).json({ error: 'Invalid creator ID' });
    }
    
    const rooms = await storage.getCreatorPrivateRooms(creatorId);
    res.json(rooms);
  } catch (error) {
    console.error('Error getting creator private rooms:', error);
    res.status(500).json({ error: 'Failed to get creator private rooms' });
  }
});

export default router;