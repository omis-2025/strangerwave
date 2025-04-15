import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authMiddleware } from '../middleware/auth';
import { 
  insertChatPreferencesSchema, 
  insertReportSchema 
} from '@shared/schema';

const router = Router();

// Set chat preferences
router.post('/preferences', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validatedData = insertChatPreferencesSchema.parse({
      ...req.body,
      userId: req.user.userId
    });
    
    const preferences = await storage.setChatPreferences(validatedData);
    res.json(preferences);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error('Set preferences error:', error);
    res.status(500).json({ error: 'Failed to set preferences' });
  }
});

// Get chat preferences
router.get('/preferences', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const preferences = await storage.getChatPreferences(req.user.userId);
    
    if (!preferences) {
      return res.json({ preferredGender: 'any', country: null });
    }
    
    res.json(preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

// Submit chat report
router.post('/report', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validatedData = insertReportSchema.parse({
      ...req.body,
      reporterId: req.user.userId
    });
    
    const report = await storage.createReport(validatedData);
    res.json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error('Submit report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Get chat history for a session
router.get('/history/:sessionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const sessionId = parseInt(req.params.sessionId);
    
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    
    // Get the session to verify the user is part of it
    const session = await storage.getChatSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    // Check if the user is part of this session
    if (session.user1Id !== req.user.userId && session.user2Id !== req.user.userId) {
      return res.status(403).json({ error: 'You do not have access to this chat session' });
    }
    
    // Get all messages from the session
    const messages = await storage.getSessionMessages(sessionId);
    
    res.json(messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

export default router;