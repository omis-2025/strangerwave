import express, { Request, Response } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { storage } from '../storage';
import { z } from 'zod';

const router = express.Router();

// Ensure all routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Fetch admin dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // In a production app, these would be actual database queries
    // For the demo, we'll return representative data
    const stats = {
      totalUsers: 12800,
      activeToday: 2450,
      premiumUsers: 986,
      conversionRate: 0.077,
      reportResolutionTime: 3.2,
      revenueToday: 4560,
      revenueThisMonth: 77545,
      averageSessionLength: 18.3,
      textToVideoRatio: 0.68,
      userRetention: 0.24,
      activeBans: 187,
      newUsers24h: 456
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Fetch users with pagination and filtering
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter = req.query.filter as string || 'all';
    const search = req.query.search as string || '';
    
    // Get users from database with appropriate filters
    const users = await storage.getAllUsers({ 
      isBanned: filter === 'banned' ? true : undefined 
    });
    
    // Apply search filter if provided
    const filteredUsers = search 
      ? users.filter(user => 
          user.username.toLowerCase().includes(search.toLowerCase()) ||
          user.id.toString().includes(search)
        )
      : users;
    
    // Apply premium filter if needed
    const finalUsers = filter === 'premium' 
      ? filteredUsers.filter(user => user.isPremium)
      : filteredUsers;
      
    // Paginate results
    const paginatedUsers = finalUsers.slice((page - 1) * limit, page * limit);
    
    res.json({
      users: paginatedUsers,
      total: finalUsers.length,
      page,
      totalPages: Math.ceil(finalUsers.length / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Ban a user
router.post('/users/:id/ban', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Ban reason is required' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const bannedUser = await storage.banUser(userId);
    
    // In a real app, you would also log the ban reason and create a ban record
    
    res.json({ success: true, user: bannedUser });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// Unban a user
router.post('/users/:id/unban', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const unbannedUser = await storage.unbanUser(userId);
    
    res.json({ success: true, user: unbannedUser });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

// Fetch reports with pagination
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const resolved = req.query.resolved === 'true';
    
    const reports = await storage.getReports(resolved);
    
    // In a real app, you would paginate these results from the database
    const paginatedReports = reports.slice((page - 1) * 10, page * 10);
    
    res.json({
      reports: paginatedReports,
      total: reports.length,
      page,
      totalPages: Math.ceil(reports.length / 10)
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Resolve a report
router.post('/reports/:id/resolve', async (req: Request, res: Response) => {
  try {
    const reportId = parseInt(req.params.id);
    
    const report = await storage.resolveReport(reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error resolving report:', error);
    res.status(500).json({ error: 'Failed to resolve report' });
  }
});

// Fetch payment transactions
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    // In a production app, these would be fetched from the database
    // For the demo, we'll return mock data
    const transactions = [
      {
        id: 1001,
        userId: 456,
        username: "sarah_k",
        amount: 2.99,
        type: "subscription",
        status: "completed",
        processor: "stripe",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: 1002,
        userId: 789,
        username: "john_d",
        amount: 10.99,
        type: "unban",
        status: "completed",
        processor: "paypal",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
      },
      {
        id: 1003,
        userId: 123,
        username: "alex_m",
        amount: 7.99,
        type: "subscription",
        status: "completed",
        processor: "stripe",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
      },
      {
        id: 1004,
        userId: 234,
        username: "emma_t",
        amount: 5.99,
        type: "boost",
        status: "pending",
        processor: "stripe",
        timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString() // 1 hour 15 minutes ago
      },
      {
        id: 1005,
        userId: 567,
        username: "michael_r",
        amount: 14.99,
        type: "subscription",
        status: "completed",
        processor: "paypal",
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 1 hour 30 minutes ago
      }
    ];
    
    res.json({
      transactions,
      total: transactions.length
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;