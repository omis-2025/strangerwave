
import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await storage.getUserStats(userId);
    const chatHistory = await storage.getUserChatHistory(userId);
    const streak = await storage.getUserStreak(userId);

    res.json({
      totalChats: stats.totalChats,
      engagementScore: stats.engagementScore,
      currentStreak: streak.current,
      chatHistory: chatHistory
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

export default router;
