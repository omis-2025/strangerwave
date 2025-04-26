process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import cors from "cors";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import { checkSecrets } from "./utils/secretsCheck";

// Configure CORS options
const corsOptions = {
  origin: true, // Allows all origins in development
  credentials: true, // Allows cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Check for required API secrets at startup
checkSecrets(['STRIPE_SECRET_KEY', 'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET']);

// Import route modules
import authRoutes from "./routes/auth";
import paymentRoutes from "./routes/payment";
import chatRoutes from "./routes/chat";
import paypalRoutes from "./routes/paypal";
import feedbackRoutes from "./routes/feedback"; // Added import for feedbackRoutes
import referralRoutes from "./routes/referral"; // Added import for referralRoutes
import downloadRoutes from "./routes/download"; // Added import for downloadRoutes


const app = express();
const PORT = process.env.PORT || 5000;

// Apply CORS middleware early in the middleware chain
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session middleware with PostgreSQL store
const PostgresqlStore = pgSession(session);

// Configure sessions if database is available
if (process.env.DATABASE_URL) {
  app.use(
    session({
      store: new PostgresqlStore({
        pool,
        tableName: 'session',
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || 'anonchat_session_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        sameSite: 'lax',
      },
    })
  );
} else {
  console.warn('DATABASE_URL not set. Session persistence will not work correctly.');
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add routes here
app.use('/api/feedback', feedbackRoutes);
app.use('/api/referral', referralRoutes);

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('', downloadRoutes); // Direct download route for the package

// Serve static HTML files for legal pages
app.get('/privacy', (req, res) => {
  res.sendFile('privacy-policy.html', { root: './' });
});

app.get('/terms', (req, res) => {
  res.sendFile('terms-of-service.html', { root: './' });
});

app.get('/legal', (req, res) => {
  res.sendFile('index.html', { root: './' });
});

(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve on the specified port (defaults to 5000 in development)
  // This serves both the API and the client
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    log(`environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();