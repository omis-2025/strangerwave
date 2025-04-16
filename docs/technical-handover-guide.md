# StrangerWave Technical Handover Guide

## Architecture Overview

StrangerWave is built using a modern full-stack architecture with the following key components:

```
┌─────────────────────────────────────────────────────────────────┐
│                     StrangerWave Architecture                    │
└─────────────────────────────────────────────────────────────────┘
                               │
           ┌──────────────────┴───────────────────┐
           ▼                                       ▼
┌─────────────────────┐                 ┌────────────────────┐
│   Client Frontend   │                 │   Server Backend   │
│   (React + TypeScript) ◄─────────────►   (Node.js + Express)
└─────────────────────┘                 └────────────────────┘
           │                                       │
           ▼                                       ▼
┌─────────────────────┐                 ┌────────────────────┐
│ WebRTC Video/Audio  │                 │ PostgreSQL Database│
└─────────────────────┘                 └────────────────────┘
           │                                       │
           ▼                                       ▼
┌─────────────────────┐                 ┌────────────────────┐
│ Mobile Framework    │                 │ External Services  │
│ (Capacitor)         │                 │ - Stripe/PayPal    │
└─────────────────────┘                 │ - Firebase Auth    │
                                        │ - OpenAI (Moderation)
                                        └────────────────────┘
```

### Key Components:

1. **Frontend**: React application with TypeScript for type safety and improved development experience.
   - Routing: wouter for lightweight routing
   - State Management: React Query for server state, React hooks for local state
   - UI Framework: Custom components built with Tailwind CSS and shadcn/ui
   - Animations: Framer Motion
   - Mobile Compatibility: Capacitor for native iOS/Android wrapping

2. **Backend**: Node.js with Express
   - API Routes: RESTful API for user management, chat sessions, payments, etc.
   - WebSockets: Real-time communication for chat and video
   - ORM: Drizzle ORM for database interactions
   - Authentication: JWT + Firebase for secure user authentication

3. **Database**: PostgreSQL with Drizzle ORM
   - User data storage
   - Chat session records
   - Premium subscription information
   - Reporting and moderation data

4. **External Services**:
   - Stripe: Payment processing for one-time payments
   - PayPal: Alternative payment processor
   - Firebase: User authentication and analytics
   - OpenAI: AI-powered content moderation

## Deployment & Setup Guide

### Prerequisites

- Node.js v16+ 
- PostgreSQL database
- Firebase project with Authentication enabled
- Stripe and PayPal developer accounts
- OpenAI API key (for moderation)

### Environment Variables

The application requires the following environment variables:

```
# Database
DATABASE_URL=postgres://username:password@host:port/database

# Authentication
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id

# Payments
STRIPE_SECRET_KEY=your-stripe-secret-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-publishable-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# OpenAI (for moderation)
OPENAI_API_KEY=your-openai-api-key

# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=your-jwt-secret-key
```

### Deployment Steps

1. **Database Setup**:
   ```bash
   npm run db:push
   ```
   This will create all necessary database tables using Drizzle ORM schema.

2. **Build Frontend**:
   ```bash
   npm run build
   ```
   This creates optimized production files in the `dist/` directory.

3. **Start the Application**:
   ```bash
   npm run start
   ```
   This starts the Express server which serves both the API and the static frontend files.

4. **Resource Requirements**:
   - Recommended: 1 vCPU / 2GB RAM for up to 100 concurrent users
   - For higher traffic: Scale horizontally with load balancing

### Cloud Deployment Options

1. **Heroku**:
   - Connect your GitHub repository
   - Configure environment variables
   - Use the Postgres add-on

2. **AWS**:
   - EC2 instance or Elastic Beanstalk for application
   - RDS for PostgreSQL database
   - S3 for static assets (optional)

3. **DigitalOcean**:
   - App Platform or Droplet
   - Managed PostgreSQL

## Scaling Considerations

1. **Database Scaling**:
   - Regular backups recommended
   - Consider read replicas for high traffic
   - Implement database query optimization

2. **WebSocket Scaling**:
   - For >1000 concurrent users, consider a WebSocket-specific service
   - Socket.io adapter for Redis to handle multiple server instances

3. **Video Chat**:
   - WebRTC performance depends on client connections, not server
   - Consider TURN server deployment for problematic NAT scenarios

4. **Content Moderation**:
   - OpenAI API has rate limits - implement queue system for high traffic
   - Consider fallback moderation systems

## Maintenance and Updates

1. **Package Updates**:
   ```bash
   npm outdated
   npm update
   ```

2. **Database Migrations**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

3. **Monitoring**:
   - Implement an error tracking service (Sentry recommended)
   - Monitor API performance with New Relic or similar

## Mobile App Deployment

1. **iOS**:
   ```bash
   npx cap add ios
   npx cap copy ios
   npx cap open ios
   ```
   Then use Xcode to build and submit to App Store.

2. **Android**:
   ```bash
   npx cap add android
   npx cap copy android
   npx cap open android
   ```
   Then use Android Studio to build and generate signed APK.

## Troubleshooting Common Issues

1. **WebRTC Connection Issues**:
   - Check STUN/TURN server configuration
   - Verify client network connectivity
   - Review browser permissions for camera/microphone

2. **Payment Processing Failures**:
   - Verify webhook configurations
   - Check API key validity
   - Test with Stripe/PayPal sandbox accounts

3. **Database Connection Issues**:
   - Verify connection string format
   - Check network security groups/firewall rules
   - Confirm PostgreSQL service is running