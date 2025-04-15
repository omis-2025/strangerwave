import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { generateToken, verifyPassword, hashPassword } from '../middleware/auth';

const router = Router();

// Validate login request
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { username, password } = loginSchema.parse(req.body);
    
    // Find user by username
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Verify password
    const passwordValid = await verifyPassword(password, user.password);
    
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been banned', isBanned: true });
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin || false
    });
    
    // Return user info and token
    res.json({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Register endpoint (for completeness - the app primarily uses anonymous users)
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { username, password } = loginSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Store IP address if provided
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Create new user
    const newUser = await storage.createUser({
      username,
      password: hashedPassword,
      uid: Math.random().toString(36).slice(2), // Generate a random UID
      ipAddress: ipAddress as string || null
    });
    
    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      username: newUser.username,
      isAdmin: newUser.isAdmin || false
    });
    
    // Return user info and token
    res.status(201).json({
      userId: newUser.id,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

export default router;