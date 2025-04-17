import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import { storage } from "./storage";
import Stripe from "stripe";
import { 
  insertChatPreferencesSchema, 
  insertReportSchema, 
  insertMessageSchema 
} from "@shared/schema";
import paypalRoutes from "./routes/paypal";
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

  return httpServer;
}

// Helper functions

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
    // Get matching users from the queue
    const matches = await storage.getMatchingUsers(preferences);
    
    // Filter out the current user and find the first viable match
    const match = matches.find(m => m.userId !== userId);
    
    if (match) {
      // Remove both users from the queue
      await storage.removeFromWaitingQueue(userId);
      await storage.removeFromWaitingQueue(match.userId);
      
      // Create a chat session
      const session = await storage.createChatSession({
        user1Id: userId,
        user2Id: match.userId,
        active: true
      });
      
      // Store the active session for both users
      activeSessions.set(userId, { partnerId: match.userId, sessionId: session.id });
      activeSessions.set(match.userId, { partnerId: userId, sessionId: session.id });
      
      // Notify both users
      sendToUser(userId, { 
        type: "match_found", 
        sessionId: session.id,
        partnerId: match.userId 
      });
      
      sendToUser(match.userId, { 
        type: "match_found", 
        sessionId: session.id,
        partnerId: userId 
      });
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
    
    // Validate the message
    const messageData = insertMessageSchema.parse({
      sessionId: activeSession.sessionId,
      senderId: userId,
      content: data.content
    });

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

    // Save the message to the database
    const message = await storage.createMessage(messageData);
    
    // Send the message to both users
    const messagePayload = {
      type: "message",
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        timestamp: message.createdAt
      }
    };
    
    sendToUser(userId, messagePayload);
    sendToUser(activeSession.partnerId, messagePayload);

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
