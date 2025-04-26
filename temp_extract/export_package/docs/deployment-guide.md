# StrangerWave Deployment Guide

This guide provides step-by-step instructions for deploying and maintaining the StrangerWave platform in a production environment. Following these best practices will ensure optimal performance, security, and scalability.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [External Services Configuration](#external-services-configuration)
5. [Deployment Options](#deployment-options)
6. [Security Considerations](#security-considerations)
7. [Scaling Strategies](#scaling-strategies)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Mobile App Publishing](#mobile-app-publishing)

## System Requirements

### Minimum Production Requirements

| Component | Minimum Recommendation | Optimal Recommendation |
|-----------|------------------------|------------------------|
| CPU | 2 vCPUs | 4+ vCPUs |
| Memory | 4 GB RAM | 8+ GB RAM |
| Storage | 20 GB SSD | 50+ GB SSD |
| Bandwidth | 5 TB/month | 10+ TB/month |
| Database | PostgreSQL 13+ | PostgreSQL 14+ with read replicas |

### Software Requirements

- Node.js 16+ (18+ recommended)
- PostgreSQL 13+
- Redis 6+ (for scaling WebSocket connections)
- Nginx or similar reverse proxy 
- STUN/TURN server for WebRTC (e.g., coturn)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/strangerwave.git
cd strangerwave
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory. Below is a template with all required variables:

```env
# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-random-string-for-jwt
CORS_ORIGIN=https://yourdomain.com

# Database
DATABASE_URL=postgres://username:password@host:port/database

# Firebase Authentication
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id

# Payment Processing
STRIPE_SECRET_KEY=your-stripe-secret-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-publishable-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# Content Moderation
OPENAI_API_KEY=your-openai-api-key

# WebRTC Configuration
STUN_SERVERS=stun:stun1.l.google.com:19302,stun:stun2.l.google.com:19302
TURN_SERVERS=turn:your-turn-server.com:3478
TURN_USERNAME=your-turn-username
TURN_CREDENTIAL=your-turn-credential
```

## Database Configuration

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE strangerwave;
CREATE USER strangerwave_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE strangerwave TO strangerwave_user;
```

### 2. Run Database Migrations

```bash
npm run db:push
```

This will create all necessary tables based on the Drizzle schema.

### 3. Database Backup Strategy

Set up regular database backups:

```bash
# Example cron job for daily backups
0 2 * * * pg_dump -U strangerwave_user -d strangerwave -f /backup/strangerwave_$(date +\%Y-\%m-\%d).sql
```

## External Services Configuration

### 1. Firebase Setup

1. Create a new Firebase project at [firebase.google.com](https://console.firebase.google.com/)
2. Enable Authentication with Anonymous login method
3. Add your domain to the authorized domains list
4. Create a web app in the project and copy the configuration values to your environment variables

### 2. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Obtain API keys from the Stripe dashboard
3. Configure webhook endpoints for payment events:
   - Payment success: `https://yourdomain.com/api/payment/webhook`
   - Set the webhook secret in your environment variables

### 3. PayPal Setup

1. Create a PayPal Developer account at [developer.paypal.com](https://developer.paypal.com)
2. Create a new application to get client ID and secret
3. Configure webhook endpoints for payment notifications

### 4. OpenAI Setup

1. Create an OpenAI account at [openai.com](https://openai.com)
2. Generate an API key and add it to your environment variables
3. Monitor usage to avoid unexpected costs

### 5. TURN Server Setup

For optimal WebRTC performance, especially behind NATs and firewalls:

```bash
# Install coturn server
apt-get install coturn

# Configure coturn
# Edit /etc/turnserver.conf with your settings
```

## Deployment Options

### Option 1: Traditional VPS/Dedicated Server

1. **Prepare the server:**
   ```bash
   # Update system
   apt-get update && apt-get upgrade -y
   
   # Install required packages
   apt-get install -y nginx certbot python3-certbot-nginx
   ```

2. **Configure Nginx:**
   ```
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Setup SSL:**
   ```bash
   certbot --nginx -d yourdomain.com
   ```

4. **Build and start the application:**
   ```bash
   npm run build
   npm run start
   ```

5. **Use a process manager:**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start the application
   pm2 start npm --name "strangerwave" -- run start
   
   # Ensure it starts on boot
   pm2 startup
   pm2 save
   ```

### Option 2: Docker Deployment

1. **Create a Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "run", "start"]
   ```

2. **Create docker-compose.yml:**
   ```yaml
   version: '3'
   
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - DATABASE_URL=postgres://username:password@db:5432/strangerwave
         # Add all other environment variables here
       depends_on:
         - db
         - redis
   
     db:
       image: postgres:14-alpine
       volumes:
         - postgres_data:/var/lib/postgresql/data
       environment:
         - POSTGRES_USER=username
         - POSTGRES_PASSWORD=password
         - POSTGRES_DB=strangerwave
   
     redis:
       image: redis:6-alpine
       volumes:
         - redis_data:/data
   
   volumes:
     postgres_data:
     redis_data:
   ```

3. **Deploy with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Option 3: Cloud Platforms

#### AWS Deployment

1. **Elastic Beanstalk**:
   - Create a new Elastic Beanstalk application
   - Choose Node.js platform
   - Upload your application as a ZIP file or connect to your repository
   - Configure environment variables through the Elastic Beanstalk console

2. **RDS for PostgreSQL**:
   - Create a PostgreSQL instance in RDS
   - Configure security groups to allow connections from your EB environment
   - Update your environment variables with the RDS connection string

#### DigitalOcean Deployment

1. **App Platform**:
   - Connect your GitHub repository
   - Select Node.js as the runtime
   - Configure environment variables
   - Add a PostgreSQL database component

#### Heroku Deployment

1. **Create a new app**:
   ```bash
   heroku create strangerwave
   ```

2. **Add PostgreSQL**:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. **Configure environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   # Set all other environment variables
   ```

4. **Deploy the application**:
   ```bash
   git push heroku main
   ```

## Security Considerations

### 1. Data Encryption

- Ensure SSL/TLS is configured for all traffic
- Implement database encryption at rest
- Store sensitive data (passwords, API keys) securely

### 2. API Security

- Implement rate limiting to prevent abuse
- Use CORS policies to restrict access to trusted domains
- Validate all user inputs to prevent injection attacks

### 3. Authentication Security

- Implement secure password policies
- Use JWT with appropriate expiration times
- Consider implementing two-factor authentication for admin access

### 4. Regular Security Audits

- Conduct regular code reviews focusing on security
- Use automated security scanning tools
- Keep all dependencies updated to prevent vulnerabilities

## Scaling Strategies

### 1. Horizontal Scaling

For handling increased user load:

- Deploy multiple application instances behind a load balancer
- Use Redis for session sharing and WebSocket coordination
- Implement a sticky session strategy for WebSocket connections

### 2. Database Scaling

- Use connection pooling to optimize database connections
- Implement read replicas for read-heavy operations
- Consider database sharding for very large user bases

### 3. Media Optimization

- Use a CDN for static assets
- Optimize image and media delivery
- Implement adaptive streaming for video chat

### 4. WebRTC Scaling

- Deploy multiple TURN servers in different regions
- Monitor WebRTC traffic and adjust capacity as needed
- Implement quality of service policies to prioritize traffic

## Monitoring and Maintenance

### 1. Application Monitoring

Set up monitoring with tools like:
- Prometheus for metrics collection
- Grafana for visualization
- ELK stack for log management

Key metrics to monitor:
- Server CPU, memory, and disk usage
- Response times and error rates
- WebSocket connection counts
- Active video chats
- Database performance

### 2. Alerting

Configure alerts for:
- Server resource thresholds (>80% CPU, >85% memory)
- High error rates (>1% of requests)
- Database connection issues
- Payment processing failures

### 3. Regular Maintenance

- Schedule regular dependency updates
- Implement a blue-green deployment strategy for zero-downtime updates
- Keep database schemas optimized with regular analysis

## Troubleshooting

### Common Issues and Solutions

1. **WebRTC Connection Failures**
   - Check STUN/TURN server configuration
   - Verify client network connectivity
   - Ensure proper permissions are granted in the browser

2. **Database Connection Issues**
   - Verify connection string format and credentials
   - Check database server status and connection limits
   - Ensure proper network access between application and database

3. **Payment Processing Failures**
   - Verify API keys and webhook configurations
   - Check for Stripe/PayPal service outages
   - Review transaction logs for detailed error messages

4. **Performance Degradation**
   - Analyze database query performance
   - Check for memory leaks in the application
   - Review server resources and scale if necessary

## Mobile App Publishing

### iOS App Store Submission

1. **Prerequisites**:
   - Apple Developer account ($99/year)
   - Xcode installed on a Mac
   - App Store Connect account configured

2. **Prepare the app**:
   ```bash
   npx cap add ios
   npx cap copy ios
   npx cap open ios
   ```

3. **Configure in Xcode**:
   - Set up app icons and splash screens
   - Configure app capabilities (camera, microphone)
   - Create App ID in Apple Developer portal
   - Configure signing certificates

4. **Submit for review**:
   - Create a new app in App Store Connect
   - Complete all metadata, screenshots, and descriptions
   - Upload the build from Xcode
   - Submit for review (typical review time: 1-3 days)

### Google Play Store Submission

1. **Prerequisites**:
   - Google Play Developer account ($25 one-time fee)
   - Android Studio installed

2. **Prepare the app**:
   ```bash
   npx cap add android
   npx cap copy android
   npx cap open android
   ```

3. **Configure in Android Studio**:
   - Set up app icons and splash screens
   - Configure app permissions
   - Create a signed APK or App Bundle

4. **Submit for review**:
   - Create a new app in Google Play Console
   - Complete all metadata, screenshots, and descriptions
   - Upload the signed APK or App Bundle
   - Submit for review (typical review time: 1-2 days)

### App Store Requirements Checklist

- [ ] Age verification mechanism implemented
- [ ] Privacy policy compliant with GDPR and CCPA
- [ ] Terms of service clearly defined
- [ ] Content moderation system in place
- [ ] In-app purchases properly configured
- [ ] All required permissions justified
- [ ] Proper handling of user data and deletion
- [ ] Accessible design for users with disabilities