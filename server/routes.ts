import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import { storage } from "./storage";
import Stripe from "stripe";
import { 
  insertChatPreferencesSchema, 
  insertReportSchema, 
  insertMessageSchema,
  insertAchievementSchema
} from "@shared/schema";
import { calculateCompatibilityScore, extractInterestsFromMessage, handleChatEnd } from "./ai-matching";
import { processNewMessage, updateUserLanguagePreference, getSupportedLanguages, translateMessage } from "./translation";
import paypalRoutes from "./routes/paypal";
import referralRoutes from "./routes/referral";
import socialRoutes from "./routes/social";
import creatorRoutes from "./routes/creator";
import profileRoutes from "./routes/profile";
import adminRoutes from "./routes/admin";
import stripeRoutes from "./routes/stripe";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe payment features will not work.');
}

// Check PayPal credentials
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.warn('PayPal credentials missing. PayPal payment features will not work.');
}

// Use the most recent API version for Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : undefined;

// WebSocket client connections map: userId -> WebSocket
const connections = new Map<number, WebSocket>();
// Active chat sessions map: userId -> { partnerId, sessionId }
const activeSessions = new Map<number, { partnerId: number, sessionId: number }>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Handle WebSocket connections
  wss.on("connection", async (ws, req) => {
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      ws.close(1008, "User ID required");
      return;
    }
    
    // Update user's connection status
    connections.set(userId, ws);
    
    // Update user's last active timestamp
    const user = await storage.getUser(userId);
    if (user) {
      await storage.updateUser(userId, { lastActive: new Date() });
    }
    
    // Handle WebSocket messages
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle different message types
        switch (message.type) {
          case "join_queue":
            await handleJoinQueue(userId, message.data);
            break;
            
          case "leave_queue":
            await handleLeaveQueue(userId);
            break;
            
          case "send_message":
            await handleSendMessage(userId, message.data);
            break;
            
          case "typing":
            await handleTypingNotification(userId, message.data);
            break;
            
          case "disconnect":
            await handleDisconnect(userId);
            break;
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
        sendToUser(userId, { type: "error", error: "Failed to process message" });
      }
    });
    
    // Handle WebSocket disconnection
    ws.on("close", async () => {
      connections.delete(userId);
      
      // If in active chat, end it
      const activeSession = activeSessions.get(userId);
      if (activeSession) {
        await handleDisconnect(userId);
      }
      
      // Remove from waiting queue
      await storage.removeFromWaitingQueue(userId);
    });
    
    // Send initial connection success message
    sendToUser(userId, { type: "connected", userId });
  });

  // API routes
  
  // Authentication - users can chat anonymously
  app.post("/api/auth/anonymous", async (req, res) => {
    try {
      // Generate a random username
      const randomUsername = `user_${Math.floor(Math.random() * 1000000)}`;
      const randomPassword = Math.random().toString(36).slice(2);
      const uid = req.body.uid || Math.random().toString(36).slice(2);
      
      // Store IP address if provided
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      
      const newUser = await storage.createUser({
        username: randomUsername,
        password: randomPassword,
        uid,
        ipAddress: ipAddress as string || null
      });
      
      // Initialize login streak for new user
      await storage.updateLoginStreak(newUser.id);
      
      res.json({ 
        userId: newUser.id, 
        username: newUser.username,
        uid: newUser.uid,
        isBanned: newUser.isBanned
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create anonymous user" });
    }
  });
  
  // Get user profile
  app.get("/api/users/:uid", async (req, res) => {
    try {
      const user = await storage.getUserByUid(req.params.uid);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        userId: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        isBanned: user.isBanned
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });
  
  // Set chat preferences
  app.post("/api/preferences", async (req, res) => {
    try {
      const validatedData = insertChatPreferencesSchema.parse(req.body);
      
      const preferences = await storage.setChatPreferences(validatedData);
      res.json(preferences);
    } catch (error) {
      res.status(400).json({ error: "Invalid preference data" });
    }
  });
  
  // Submit report
  app.post("/api/reports", async (req, res) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      
      const report = await storage.createReport(validatedData);
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid report data" });
    }
  });
  
  // Admin routes
  
  // Get all users (admin only)
  app.get("/api/admin/users", async (req, res) => {
    try {
      // In a real app, would check admin status here
      const filterBanned = req.query.banned === 'true' ? true : 
                           req.query.banned === 'false' ? false : undefined;
      
      const users = await storage.getAllUsers(
        filterBanned !== undefined ? { isBanned: filterBanned } : undefined
      );
      
      res.json(users.map(user => ({
        id: user.id,
        username: user.username,
        isBanned: user.isBanned,
        lastActive: user.lastActive,
        ipAddress: user.ipAddress
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });
  
  // Ban a user
  app.post("/api/admin/users/:id/ban", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // In a real app, would check admin status here
      const user = await storage.banUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Notify the user they've been banned
      sendToUser(userId, { type: "banned" });
      
      // If they're in an active session, end it
      await handleDisconnect(userId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to ban user" });
    }
  });
  
  // Unban a user
  app.post("/api/admin/users/:id/unban", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // In a real app, would check admin status here
      const user = await storage.unbanUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unban user" });
    }
  });
  
  // Get all reports (admin only)
  app.get("/api/admin/reports", async (req, res) => {
    try {
      // In a real app, would check admin status here
      const resolved = req.query.resolved === 'true' ? true : 
                       req.query.resolved === 'false' ? false : undefined;
      
      const reports = await storage.getReports(resolved);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to get reports" });
    }
  });
  
  // Resolve a report
  app.post("/api/admin/reports/:id/resolve", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) {
        return res.status(400).json({ error: "Invalid report ID" });
      }
      
      // In a real app, would check admin status here
      const report = await storage.resolveReport(reportId);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve report" });
    }
  });

  // Payment routes
  
  // Create a payment intent for banned users
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      // Check if Stripe is configured
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured" });
      }
      
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (!user.isBanned) {
        return res.status(400).json({ error: "User is not banned" });
      }
      
      // Create a payment intent for $10.99
      const amount = 1099; // in cents
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        // Store the user ID in the metadata
        metadata: { userId: user.id.toString() }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });
  
  // Webhook for successful payment
  app.post("/api/webhook", async (req, res) => {
    try {
      // Check if Stripe is configured
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured" });
      }
      
      // Verify the event
      const event = req.body;
      
      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          const userId = parseInt(paymentIntent.metadata.userId);
          
          if (!isNaN(userId)) {
            // Unban the user
            await storage.unbanUser(userId);
            
            // Notify the user they've been unbanned
            sendToUser(userId, { type: "unbanned" });
          }
          break;
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });
  
  // Register PayPal routes
  app.use('/api/paypal', paypalRoutes);
  
  // Register profile routes
  app.use('/api/user', profileRoutes);
  
  // Register admin routes
  app.use('/api/admin', adminRoutes);
  
  // Register Stripe routes
  app.use('/api/stripe', stripeRoutes);
  
  // Register referral routes
  app.use('/api/referral', referralRoutes);
  
  // Register social sharing routes
  app.use('/api/social', socialRoutes);
  
  // Register creator mode routes
  app.use('/api/creator', creatorRoutes);
  
  // Streak and Achievement routes

  // Get user streaks
  app.get('/api/users/:id/streaks', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const streaks = await storage.getUserStreaks(userId);
      res.json(streaks);
    } catch (error) {
      console.error('Error getting user streaks:', error);
      res.status(500).json({ error: 'Failed to get user streaks' });
    }
  });
  
  // Get user's specific streak type
  app.get('/api/users/:id/streaks/:type', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const streakType = req.params.type;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      if (!['login', 'chat'].includes(streakType)) {
        return res.status(400).json({ error: 'Invalid streak type' });
      }
      
      const streak = await storage.getUserStreak(userId, streakType);
      if (!streak) {
        return res.status(404).json({ error: 'Streak not found' });
      }
      
      res.json(streak);
    } catch (error) {
      console.error('Error getting user streak:', error);
      res.status(500).json({ error: 'Failed to get user streak' });
    }
  });
  
  // Update login streak (manual trigger for testing)
  app.post('/api/users/:id/streaks/login/update', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const streak = await storage.updateLoginStreak(userId);
      await checkLoginAchievements(userId);
      
      res.json(streak);
    } catch (error) {
      console.error('Error updating login streak:', error);
      res.status(500).json({ error: 'Failed to update login streak' });
    }
  });
  
  // Update chat streak (manual trigger for testing)
  app.post('/api/users/:id/streaks/chat/update', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const streak = await storage.updateChatStreak(userId);
      await checkChatAchievements(userId);
      
      res.json(streak);
    } catch (error) {
      console.error('Error updating chat streak:', error);
      res.status(500).json({ error: 'Failed to update chat streak' });
    }
  });
  
  // Get user achievements
  app.get('/api/users/:id/achievements', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error('Error getting user achievements:', error);
      res.status(500).json({ error: 'Failed to get user achievements' });
    }
  });
  
  // Get undisplayed achievements (new achievements to show to the user)
  app.get('/api/users/:id/achievements/new', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const newAchievements = await storage.getUndisplayedAchievements(userId);
      res.json(newAchievements);
    } catch (error) {
      console.error('Error getting undisplayed achievements:', error);
      res.status(500).json({ error: 'Failed to get undisplayed achievements' });
    }
  });
  
  // Mark an achievement as displayed
  app.post('/api/users/:userId/achievements/:achievementId/display', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievementId = parseInt(req.params.achievementId);
      
      if (isNaN(userId) || isNaN(achievementId)) {
        return res.status(400).json({ error: 'Invalid IDs' });
      }
      
      const userAchievement = await storage.getUserAchievement(userId, achievementId);
      if (!userAchievement) {
        return res.status(404).json({ error: 'Achievement not found for this user' });
      }
      
      await storage.markAchievementDisplayed(userAchievement.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking achievement as displayed:', error);
      res.status(500).json({ error: 'Failed to mark achievement as displayed' });
    }
  });
  
  // Get all achievements (for admin or achievement page)
  app.get('/api/achievements', async (req, res) => {
    try {
      const category = req.query.category as string;
      let achievements;
      
      if (category) {
        achievements = await storage.getAchievementsByCategory(category);
      } else {
        achievements = await storage.getAllAchievements();
      }
      
      res.json(achievements);
    } catch (error) {
      console.error('Error getting achievements:', error);
      res.status(500).json({ error: 'Failed to get achievements' });
    }
  });

  // Translation related routes
  
  // Get all supported languages
  app.get('/api/languages', async (req, res) => {
    try {
      const languages = await getSupportedLanguages();
      res.json(languages);
    } catch (error) {
      console.error('Error getting supported languages:', error);
      res.status(500).json({ error: 'Failed to get supported languages' });
    }
  });
  
  // Set user language preference
  app.post('/api/users/:id/language', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { language } = req.body;
      
      if (!language || typeof language !== 'string' || language.length > 10) {
        return res.status(400).json({ error: 'Invalid language code' });
      }
      
      const success = await updateUserLanguagePreference(userId, language);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to update language preference' });
      }
    } catch (error) {
      console.error('Error setting language preference:', error);
      res.status(500).json({ error: 'Failed to set language preference' });
    }
  });
  
  // Translate a message
  app.post('/api/messages/:id/translate', async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const { targetLanguage } = req.body;
      
      if (!targetLanguage || typeof targetLanguage !== 'string' || targetLanguage.length > 10) {
        return res.status(400).json({ error: 'Invalid target language' });
      }
      
      const translatedText = await translateMessage(messageId, targetLanguage);
      
      if (translatedText) {
        res.json({ translatedText });
      } else {
        res.status(500).json({ error: 'Failed to translate message' });
      }
    } catch (error) {
      console.error('Error translating message:', error);
      res.status(500).json({ error: 'Failed to translate message' });
    }
  });

  return httpServer;
}

// Helper functions

/**
 * Checks achievements related to login streaks
 */
async function checkLoginAchievements(userId: number) {
  try {
    // Get the user's login streak
    const loginStreak = await storage.getUserStreak(userId, 'login');
    if (!loginStreak) return;
    
    // Achievement checks based on login streak
    if (loginStreak.currentStreak >= 3) {
      // 3-day login streak achievement
      await earnAchievementIfNotExists(userId, 'login_streak_3');
    }
    
    if (loginStreak.currentStreak >= 7) {
      // 7-day login streak achievement
      await earnAchievementIfNotExists(userId, 'login_streak_7');
    }
    
    if (loginStreak.currentStreak >= 30) {
      // 30-day login streak achievement
      await earnAchievementIfNotExists(userId, 'login_streak_30');
    }
    
    // Check for longest streak achievements
    if (loginStreak.longestStreak >= 60) {
      await earnAchievementIfNotExists(userId, 'login_streak_60');
    }
    
    if (loginStreak.longestStreak >= 100) {
      await earnAchievementIfNotExists(userId, 'login_streak_100');
    }
  } catch (error) {
    console.error('Error checking login achievements:', error);
  }
}

/**
 * Checks achievements related to chat streaks
 */
async function checkChatAchievements(userId: number) {
  try {
    // Get the user's chat streak
    const chatStreak = await storage.getUserStreak(userId, 'chat');
    if (!chatStreak) return;
    
    // Achievement checks based on chat streak
    if (chatStreak.currentStreak >= 3) {
      // 3-day chat streak achievement
      await earnAchievementIfNotExists(userId, 'chat_streak_3');
    }
    
    if (chatStreak.currentStreak >= 7) {
      // 7-day chat streak achievement
      await earnAchievementIfNotExists(userId, 'chat_streak_7');
    }
    
    if (chatStreak.currentStreak >= 14) {
      // 14-day chat streak achievement
      await earnAchievementIfNotExists(userId, 'chat_streak_14');
    }
    
    // Also check session count achievements
    const user = await storage.getUser(userId);
    if (user && user.sessionCount) {
      if (user.sessionCount >= 10) {
        await earnAchievementIfNotExists(userId, 'sessions_10');
      }
      
      if (user.sessionCount >= 50) {
        await earnAchievementIfNotExists(userId, 'sessions_50');
      }
      
      if (user.sessionCount >= 100) {
        await earnAchievementIfNotExists(userId, 'sessions_100');
      }
    }
  } catch (error) {
    console.error('Error checking chat achievements:', error);
  }
}

/**
 * Grants an achievement to a user if they don't already have it
 */
async function earnAchievementIfNotExists(userId: number, achievementCode: string) {
  try {
    // Find the achievement by code
    const allAchievements = await storage.getAllAchievements();
    const achievement = allAchievements.find(a => a.code === achievementCode);
    
    if (!achievement) {
      console.warn(`Achievement with code ${achievementCode} not found`);
      return;
    }
    
    // Check if user already has this achievement
    const userAchievement = await storage.getUserAchievement(userId, achievement.id);
    
    if (!userAchievement) {
      // If not, grant it
      await storage.earnAchievement(userId, achievement.id);
      console.log(`User ${userId} earned achievement: ${achievement.name}`);
    }
  } catch (error) {
    console.error(`Error earning achievement ${achievementCode} for user ${userId}:`, error);
  }
}

function getUserIdFromRequest(req: any): number | null {
  const uid = new URL(req.url, "http://localhost").searchParams.get("uid");
  if (!uid) return null;
  
  // In a real app, you'd validate this token/session
  return parseInt(uid);
}

function sendToUser(userId: number, message: any) {
  const ws = connections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// WebSocket message handlers

async function handleJoinQueue(userId: number, data: any) {
  try {
    // Check if user is banned
    const user = await storage.getUser(userId);
    if (!user || user.isBanned) {
      return sendToUser(userId, { 
        type: "error", 
        error: "You are banned from the chat" 
      });
    }
    
    // Remove from any existing queue
    await storage.removeFromWaitingQueue(userId);
    
    // Add to queue with preferences
    await storage.addToWaitingQueue({
      userId,
      preferredGender: data.preferredGender || 'any',
      country: data.country || null
    });
    
    sendToUser(userId, { type: "queue_joined" });
    
    // Try to find a match
    await findMatch(userId, {
      preferredGender: data.preferredGender,
      country: data.country
    });
  } catch (error) {
    console.error("Error joining queue:", error);
    sendToUser(userId, { type: "error", error: "Failed to join queue" });
  }
}

async function handleLeaveQueue(userId: number) {
  try {
    await storage.removeFromWaitingQueue(userId);
    sendToUser(userId, { type: "queue_left" });
  } catch (error) {
    console.error("Error leaving queue:", error);
    sendToUser(userId, { type: "error", error: "Failed to leave queue" });
  }
}

async function findMatch(userId: number, preferences: any) {
  try {
    // Get user data needed for matching
    const user = await storage.getUser(userId);
    if (!user) {
      console.error("User not found for matching:", userId);
      return;
    }

    // Get potential matches from the queue based on basic criteria
    const potentialMatches = await storage.getMatchingUsers(preferences);
    if (!potentialMatches.length || potentialMatches.every(m => m.userId === userId)) {
      return; // No potential matches found
    }
    
    // Get user metrics for advanced matching if available
    const userMetrics = await storage.getUserInteractionMetrics(userId);
    
    // Get active algorithm config
    const algorithms = await storage.getActiveMatchingAlgorithms();
    const algorithmConfig = algorithms.length ? algorithms[0] : null;
    const algorithmParams = algorithmConfig?.parameters;
    
    // Initialize match scores
    const matchScores: { userId: number; score: number }[] = [];
    
    // Calculate compatibility score for each potential match
    for (const potMatch of potentialMatches) {
      if (potMatch.userId === userId) continue;
      
      const matchUser = await storage.getUser(potMatch.userId);
      const matchMetrics = await storage.getUserInteractionMetrics(potMatch.userId);
      
      if (matchUser) {
        // Calculate compatibility score
        const score = calculateCompatibilityScore(
          user,
          matchUser,
          userMetrics,
          matchMetrics,
          algorithmParams
        );
        
        matchScores.push({
          userId: matchUser.id,
          score
        });
      }
    }
    
    // Sort by score (descending) and take the best match
    const sortedMatches = matchScores.sort((a, b) => b.score - a.score);
    const bestMatch = sortedMatches.length ? sortedMatches[0] : null;
    
    if (bestMatch) {
      const matchUserId = bestMatch.userId;
      
      // Remove both users from the queue
      await storage.removeFromWaitingQueue(userId);
      await storage.removeFromWaitingQueue(matchUserId);
      
      // Update last matched timestamp
      await storage.updateUser(userId, { lastMatchedAt: new Date() });
      await storage.updateUser(matchUserId, { lastMatchedAt: new Date() });
      
      // Create a chat session with algorithm data
      const session = await storage.createChatSession({
        user1Id: userId,
        user2Id: matchUserId,
        active: true,
        algorithmId: algorithmConfig?.id,
        matchQualityScore: bestMatch.score
      });
      
      // Store the active session for both users
      activeSessions.set(userId, { partnerId: matchUserId, sessionId: session.id });
      activeSessions.set(matchUserId, { partnerId: userId, sessionId: session.id });
      
      // Notify both users
      sendToUser(userId, { 
        type: "match_found", 
        sessionId: session.id,
        partnerId: matchUserId,
        matchScore: Math.round(bestMatch.score * 100) // Send score as percentage
      });
      
      sendToUser(matchUserId, { 
        type: "match_found", 
        sessionId: session.id,
        partnerId: userId,
        matchScore: Math.round(bestMatch.score * 100) // Send score as percentage
      });
      
      console.log(`AI Matching: Matched users ${userId} and ${matchUserId} with score ${bestMatch.score}`);
    }
  } catch (error) {
    console.error("Error finding match:", error);
  }
}

async function handleSendMessage(userId: number, data: any) {
  try {
    const activeSession = activeSessions.get(userId);
    if (!activeSession) {
      return sendToUser(userId, { 
        type: "error", 
        error: "No active chat session" 
      });
    }
    
    // Get the partner ID for translation
    const partnerId = activeSession.partnerId;
    
    // Check if we need to import the moderation function
    let moderationResult = null;
    try {
      // Dynamically import moderation to avoid issues if OpenAI is not configured
      const { moderateMessage } = await import('./moderation');
      // Moderate the message content for harmful content
      moderationResult = await moderateMessage(userId, data.content);
    } catch (modError) {
      console.error("Moderation error:", modError);
      // Continue without moderation if it fails
    }
    
    // Process message for translation
    let messageContent = data.content;
    let isTranslated = false;
    let detectedLanguage = 'en';
    
    try {
      // Process the message for translation if needed
      const translationResult = await processNewMessage(
        data.content,
        userId,
        partnerId
      );
      
      messageContent = translationResult.content;
      isTranslated = translationResult.isTranslated;
      detectedLanguage = translationResult.detectedLanguage;
    } catch (transError) {
      console.error("Translation error:", transError);
      // Continue with original message if translation fails
    }
    
    // Validate the message
    const messageData = insertMessageSchema.parse({
      sessionId: activeSession.sessionId,
      senderId: userId,
      content: messageContent,
      // Add translation metadata
      detectedLanguage,
      isTranslated,
      originalContent: isTranslated ? data.content : null
    });

    // Save the message to the database
    const message = await storage.createMessage(messageData);
    
    // Send the message to both users
    const messagePayload = {
      type: "message",
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        timestamp: message.createdAt,
        isTranslated: message.isTranslated,
        detectedLanguage: message.detectedLanguage,
        originalContent: message.originalContent
      }
    };
    
    // Send to sender (original or translated based on UI needs)
    sendToUser(userId, messagePayload);
    
    // Send to recipient (always translated if needed)
    sendToUser(partnerId, messagePayload);
    
    // Extract interests from message content for AI matching improvements
    try {
      // Always use the original message content for interest extraction
      await extractInterestsFromMessage(data.content, userId);
    } catch (interestError) {
      console.error("Error extracting interests:", interestError);
      // Continue even if interest extraction fails
    }

    // Handle moderation actions if message was flagged
    if (moderationResult?.isFlagged) {
      console.log(`Message from User ${userId} flagged. Toxicity score: ${moderationResult.toxicityScore}`);
      
      // Create a report for the flagged message
      await storage.createReport({
        reporterId: 0, // System-generated report
        reportedId: userId,
        sessionId: activeSession.sessionId,
        reason: "AI Moderation Flag",
        details: `Toxicity score: ${moderationResult.toxicityScore}. Categories: ${JSON.stringify(moderationResult.categories)}`
      });

      // If user was auto-banned, notify them and end the session
      if (moderationResult.autoBanned) {
        sendToUser(userId, { 
          type: "banned", 
          reason: "Your message was flagged as inappropriate by our automated system." 
        });
        
        // Notify partner
        sendToUser(activeSession.partnerId, { 
          type: "partner_banned",
          message: "Your chat partner has been removed due to a violation of our community guidelines."
        });
        
        // End the session
        await handleDisconnect(userId);
      }
    }
  } catch (error) {
    console.error("Error sending message:", error);
    sendToUser(userId, { type: "error", error: "Failed to send message" });
  }
}

async function handleTypingNotification(userId: number, data: any) {
  try {
    const activeSession = activeSessions.get(userId);
    if (!activeSession) return;
    
    // Forward typing notification to partner
    sendToUser(activeSession.partnerId, { 
      type: "typing",
      isTyping: !!data.isTyping
    });
  } catch (error) {
    console.error("Error handling typing notification:", error);
  }
}

async function handleDisconnect(userId: number) {
  try {
    const activeSession = activeSessions.get(userId);
    if (!activeSession) return;
    
    // Get partner info before removing the session
    const partnerId = activeSession.partnerId;
    const sessionId = activeSession.sessionId;
    
    // Remove active sessions
    activeSessions.delete(userId);
    activeSessions.delete(partnerId);
    
    // Get the session data for tracking metrics
    const session = await storage.getChatSession(sessionId);
    if (session) {
      // Calculate session duration in seconds
      const startTime = session.startedAt?.getTime() || 0;
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);
      
      // Track chat metrics for AI matching improvement
      try {
        await handleChatEnd(userId, sessionId, durationSeconds);
        await handleChatEnd(partnerId, sessionId, durationSeconds);
        
        // Only update chat streaks for chats that last longer than 30 seconds
        if (durationSeconds >= 30) {
          // Update chat streaks for both users
          await storage.updateChatStreak(userId);
          await storage.updateChatStreak(partnerId);
          
          // Check for any achievements that might be earned for these chat sessions
          await checkChatAchievements(userId);
          await checkChatAchievements(partnerId);
        }
      } catch (metricsError) {
        console.error("Error updating chat metrics:", metricsError);
      }
    }
    
    // End the chat session
    await storage.endChatSession(sessionId);
    
    // Notify the partner
    sendToUser(partnerId, { type: "partner_disconnected" });
    
    // Confirm to the user
    sendToUser(userId, { type: "disconnected" });
  } catch (error) {
    console.error("Error disconnecting:", error);
    sendToUser(userId, { type: "error", error: "Failed to disconnect" });
  }
}
