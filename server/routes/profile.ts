import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage';

const router = express.Router();

// Update user profile (gender, etc.)
router.post('/update-profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { gender } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user.userId;
    
    // Update the user profile with the new gender
    const updatedUser = await storage.updateUser(userId, { gender });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return the updated user object (without sensitive fields)
    const { password, ...userWithoutPassword } = updatedUser;
    return res.status(200).json({ message: 'Profile updated successfully', user: userWithoutPassword });
    
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Failed to update profile: ' + error.message });
  }
});

// Get user profile information
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user.userId;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data without sensitive fields
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
    
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Failed to fetch profile: ' + error.message });
  }
});

export default router;