import { Router } from 'express';
const router = Router();

router.post('/api/feedback', async (req, res) => {
  try {
    const { feedback, rating } = req.body;

    const result = await storage.createFeedback({
      feedback,
      rating,
      createdAt: new Date(),
      userId: req.user?.id
    });

    res.json({ success: true, feedbackId: result.id });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

export default router;