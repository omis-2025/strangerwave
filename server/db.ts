import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon Database WebSocket support
neonConfig.webSocketConstructor = ws;

// Export database pool and drizzle instance
export let pool: Pool;
export let db: ReturnType<typeof drizzle>;

// Comprehensive database connection check
function checkDatabaseEnvironment() {
  const requiredVars = ['DATABASE_URL', 'PGUSER', 'PGPASSWORD', 'PGDATABASE', 'PGHOST', 'PGPORT'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('⚠️ Missing required database environment variables:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    console.error('Database connections may fail in deployment.');
    
    // In development with Replit, we can often continue even with some missing vars
    // because DATABASE_URL is the primary connection string
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database? " +
        "Make sure this environment variable is available in your deployment."
      );
    }
  } else {
    console.log('✅ All database environment variables are properly set.');
  }
}

// Initialize the database connection
function initializeDatabase() {
  try {
    console.log('console.log('Connecting to PostgreSQL database...');
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

let retryCount = 0;
const connectWithRetry = async () => {
  try {
    await db.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
  } catch (err) {
    retryCount++;
    console.error(`Database connection attempt ${retryCount} failed:`, err);
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
      setTimeout(connectWithRetry, RETRY_DELAY);
    } else {
      console.error('Failed to connect to database after maximum retries');
      process.exit(1);
    }
  }
};

connectWithRetry();');
    
    // Configure the pool
    const poolConfig: any = { 
      connectionString: process.env.DATABASE_URL,
      // Add connection resiliency
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection not established
    };
    
    // Add individual connection parameters as fallback
    if (process.env.PGUSER) poolConfig.user = process.env.PGUSER;
    if (process.env.PGPASSWORD) poolConfig.password = process.env.PGPASSWORD;
    if (process.env.PGDATABASE) poolConfig.database = process.env.PGDATABASE;
    if (process.env.PGHOST) poolConfig.host = process.env.PGHOST;
    if (process.env.PGPORT) poolConfig.port = parseInt(process.env.PGPORT);
    
    // Create the connection pool
    pool = new Pool(poolConfig);
    
    // Add event listeners for connection issues
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
      // Don't crash the server on connection errors, but log them prominently
    });
    
    // Initialize Drizzle ORM with the pool
    db = drizzle({ client: pool, schema });
    
    // Test the connection
    pool.query('SELECT NOW()')
      .then(() => console.log('✅ Successfully connected to PostgreSQL database'))
      .catch(err => console.error('❌ Database connection test failed:', err.message));
      
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database connection pool:', error);
    // Re-throw in development, but in production we'll let the server start anyway
    // and show appropriate errors when database operations are attempted
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    return false;
  }
}

// Run environment checks and initialize the database
checkDatabaseEnvironment();
initializeDatabase();
