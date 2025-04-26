# StrangerWave: Technical Setup Guide

This guide provides comprehensive instructions for setting up and deploying the StrangerWave application. It's intended for technical buyers who need to install, configure, and deploy the application to a production environment.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [Third-Party Service Configuration](#third-party-service-configuration)
5. [Production Deployment](#production-deployment)
6. [WebRTC Configuration](#webrtc-configuration)
7. [Security Considerations](#security-considerations)
8. [Scaling Recommendations](#scaling-recommendations)
9. [Maintenance & Updates](#maintenance--updates)
10. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Server Requirements
- **CPU**: 2 vCPUs (4 vCPUs recommended for production)
- **RAM**: 4GB (8GB recommended for production)
- **Storage**: 20GB SSD
- **Network**: High-speed connection with low latency
- **Operating System**: Ubuntu 20.04 LTS or newer

### Software Requirements
- **Node.js**: v16.x or newer
- **PostgreSQL**: v13.x or newer
- **Redis**: v6.x or newer (optional, for larger deployments)
- **Nginx**: For reverse proxy (recommended for production)
- **Let's Encrypt**: For SSL certificates

### Development Tools
- **npm** or **yarn**: For package management
- **TypeScript**: For code compilation
- **Drizzle ORM**: For database migrations

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-account/strangerwave.git
cd strangerwave
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/strangerwave
PGHOST=localhost
PGPORT=5432
PGDATABASE=strangerwave
PGUSER=your_username
PGPASSWORD=your_password

# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe
VITE_STRIPE_PUBLIC_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret

# App Configuration
NODE_ENV=development
PORT=5000
```

### Step 4: Start Development Server

```bash
npm run dev
# or
yarn dev
```

The development server should now be running at `http://localhost:5000`.

---

## Database Setup

StrangerWave uses PostgreSQL with Drizzle ORM for database management.

### Step 1: Create a PostgreSQL Database

```bash
psql -U postgres
CREATE DATABASE strangerwave;
CREATE USER strangerwave_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE strangerwave TO strangerwave_user;
\q
```

### Step 2: Run Database Migrations

```bash
npm run db:push
# or
yarn db:push
```

This will create all the necessary tables using Drizzle ORM.

### Step 3: Verify Database Setup

```bash
npm run db:check
# or
yarn db:check
```

This script will verify that the database is properly configured and accessible.

---

## Third-Party Service Configuration

For detailed instructions on setting up third-party services, see the [Third-Party Services Setup Guide](./third-party-services-setup.md).

### Required External Services
1. **Firebase** - Authentication
2. **Stripe** - Payment processing 
3. **PayPal** - Alternative payment method
4. **PostgreSQL Database** - Data storage

---

## Production Deployment

### Option 1: Standard VPS Deployment

#### Step 1: Prepare Your Server

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required dependencies
sudo apt install -y nodejs npm postgresql nginx certbot python3-certbot-nginx

# Install PM2 for process management
sudo npm install -g pm2
```

#### Step 2: Clone and Setup the Application

```bash
# Clone the repository
git clone https://github.com/your-account/strangerwave.git
cd strangerwave

# Install dependencies
npm install --production

# Create production build
npm run build
```

#### Step 3: Configure Nginx

Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/strangerwave
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/strangerwave /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 4: Setup SSL with Let's Encrypt

```bash
sudo certbot --nginx -d your-domain.com
```

#### Step 5: Start the Application

```bash
# Create a PM2 configuration file
echo '{
  "apps": [{
    "name": "strangerwave",
    "script": "server/index.js",
    "instances": "max",
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production",
      "PORT": 5000
    }
  }]
}' > ecosystem.config.json

# Start the application with PM2
pm2 start ecosystem.config.json

# Ensure PM2 starts on reboot
pm2 startup
pm2 save
```

### Option 2: Docker Deployment

#### Step 1: Create a Dockerfile

```bash
echo 'FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "server/index.js"]' > Dockerfile
```

#### Step 2: Create a Docker Compose File

```bash
echo 'version: "3"
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
      - VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
      - VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
      - VITE_STRIPE_PUBLIC_KEY=${VITE_STRIPE_PUBLIC_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID}
      - PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET}
    restart: always' > docker-compose.yml
```

#### Step 3: Build and Run with Docker Compose

```bash
docker-compose up -d
```

### Option 3: Platform as a Service (PaaS)

The application can also be deployed to platforms like:
- Heroku
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

Follow the platform-specific deployment instructions and make sure to configure all required environment variables.

---

## WebRTC Configuration

StrangerWave uses WebRTC for video chat functionality. This section outlines the special considerations for WebRTC in production.

### TURN Server Setup

For reliable WebRTC connections (especially with users behind strict firewalls or NATs), you need a TURN server:

#### Option 1: Self-Hosted TURN Server

1. Install Coturn:
```bash
sudo apt install -y coturn
```

2. Configure Coturn:
```bash
sudo nano /etc/turnserver.conf
```

Add the following configuration:
```
listening-port=3478
fingerprint
lt-cred-mech
user=strangerwave:turnpassword
realm=your-domain.com
```

3. Start Coturn:
```bash
sudo systemctl enable coturn
sudo systemctl start coturn
```

#### Option 2: Managed TURN Service

Use a commercial TURN service provider such as:
- Twilio Network Traversal Service
- XirSys
- Subspace WebRTC

### WebRTC Configuration in the Application

Update the ICE servers configuration in `client/src/lib/webRTC.ts`:

```typescript
const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    },
    {
      urls: "turn:your-domain.com:3478",
      username: "strangerwave",
      credential: "turnpassword"
    }
  ]
};
```

---

## Security Considerations

### API Rate Limiting

Implement API rate limiting to prevent abuse:

```javascript
// In server/index.ts, add the following:

import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Apply to all routes
app.use('/api/', apiLimiter);
```

### Content Security Policy

Add a Content Security Policy to your Nginx configuration:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://js.stripe.com https://www.paypal.com; connect-src 'self' wss: https://*.firebaseio.com https://*.stripe.com https://api.paypal.com; frame-src https://js.stripe.com https://www.paypal.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';";
```

### Firebase Rules

Secure your Firebase database with proper rules:

```javascript
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('admins').child(auth.uid).exists()",
        ".write": "$uid === auth.uid || root.child('admins').child(auth.uid).exists()"
      }
    }
  }
}
```

---

## Scaling Recommendations

As your user base grows, you'll need to scale your infrastructure:

### Horizontal Scaling

1. **Load Balancer**: Add an Nginx load balancer or cloud load balancer in front of multiple application instances
2. **Multiple App Instances**: Run multiple instances of the application behind the load balancer
3. **WebSocket Clustering**: Use Redis for WebSocket clustering if running multiple instances
4. **Database Read Replicas**: Add PostgreSQL read replicas for heavy read operations

### Performance Optimization

1. **CDN Integration**: Add a CDN for static assets:

```nginx
location /assets/ {
    expires max;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri @proxy;
}
```

2. **Database Indexing**:

```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_chat_sessions_creation_date ON chat_sessions(created_at);
```

3. **Redis Caching**:

```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache active users
async function getActiveUsers() {
  const cached = await redis.get('active_users');
  if (cached) return JSON.parse(cached);
  
  const users = await db.query.waitingQueue.findMany();
  await redis.set('active_users', JSON.stringify(users), 'EX', 60); // Cache for 60 seconds
  return users;
}
```

---

## Maintenance & Updates

### Database Backups

Schedule regular database backups:

```bash
# Create a backup script
echo '#!/bin/bash
BACKUP_DIR="/var/backups/strangerwave"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR
pg_dump -U strangerwave_user -d strangerwave -F c -f "$BACKUP_DIR/strangerwave_$TIMESTAMP.backup"
find $BACKUP_DIR -type f -mtime +7 -delete' > /usr/local/bin/backup_strangerwave.sh
chmod +x /usr/local/bin/backup_strangerwave.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup_strangerwave.sh") | crontab -
```

### Application Updates

To update the application:

```bash
# Pull latest changes
git pull

# Install any new dependencies
npm install

# Build the application
npm run build

# Restart the application
pm2 reload ecosystem.config.json
```

### Database Migrations

When schema changes are needed:

```bash
# Run database migrations
npm run db:push
```

---

## Troubleshooting

### Common Issues

#### WebSocket Connection Failures

**Symptoms**: Users cannot connect to chat or video connections fail.

**Solution**:
1. Check that your proxy is configured correctly for WebSockets
2. Ensure the WebSocket path is properly exposed in Nginx configuration
3. Verify no firewall is blocking WebSocket connections

#### Database Connection Issues

**Symptoms**: Application errors with database connection failures.

**Solution**:
1. Verify DATABASE_URL environment variable is correct
2. Check PostgreSQL service is running
3. Ensure database user has proper permissions
4. Check network connectivity between app and database

#### Payment Processing Failures

**Symptoms**: Users cannot complete payments.

**Solution**:
1. Verify Stripe/PayPal API keys are correct
2. Check webhook configurations
3. Look at Stripe/PayPal dashboards for detailed error information
4. Ensure all required environment variables are set

### Logging

Enhanced logging can help diagnose issues:

```javascript
// In server/index.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Use logger throughout the application
logger.info('Application started');
logger.error('Error occurred', { error: err });
```

### Support Resources

If you encounter issues you cannot resolve, contact support:

- Open an issue on the GitHub repository
- Check the FAQ section in the documentation
- Contact the StrangerWave support team at support@strangerwave.com

---

For additional technical information, refer to the specific documentation for each third-party service or component used in the application.