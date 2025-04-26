# StrangerWave High-Level Architecture

This document provides a comprehensive overview of the StrangerWave platform architecture, designed to help potential buyers understand the technical foundation of the application.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           StrangerWave Platform                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                 ┌──────────────────┴───────────────────┐
                 ▼                                       ▼
        ┌─────────────────┐                   ┌─────────────────┐
        │ Client Layer    │                   │ Server Layer    │
        └─────────────────┘                   └─────────────────┘
                 │                                       │
    ┌────────────┼────────────┐            ┌────────────┼────────────┐
    ▼            ▼            ▼            ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Web App │ │ iOS App │ │ Android │  │ API     │  │WebSocket│  │  Admin  │
│         │ │         │ │  App    │  │ Server  │  │ Server  │  │  Panel  │
└─────────┘ └─────────┘ └─────────┘  └─────────┘  └─────────┘  └─────────┘
    │            │            │           │            │            │
    └────────────┴────────────┘           └────────────┴────────────┘
             │                                         │
             ▼                                         ▼
    ┌─────────────────┐                      ┌──────────────────────┐
    │ Feature Modules │                      │  Service Integrations│
    └─────────────────┘                      └──────────────────────┘
             │                                         │
    ┌────────┴────────┐                     ┌──────────┴──────────┐
    ▼        ▼        ▼                     ▼        ▼         ▼         ▼
┌─────────┐┌─────┐┌─────────┐        ┌──────────┐┌─────────┐┌─────────┐┌─────┐
│ Text    ││Video││ User    │        │PostgreSQL││ Firebase││ Stripe/  ││OpenAI│
│ Chat    ││Chat ││Matching │        │  Database││   Auth  ││ PayPal   ││ AI   │
└─────────┘└─────┘└─────────┘        └──────────┘└─────────┘└─────────┘└─────┘
```

## Component Overview

### Client Layer

The client layer consists of three primary platforms, all sharing a common codebase with platform-specific optimizations:

1. **Web Application**
   - Built with React + TypeScript
   - UI components using Tailwind CSS and shadcn/ui
   - State management with React Query and React Context
   - Animation with Framer Motion
   - WebRTC implementation for video chat
   - Real-time communication via WebSockets

2. **iOS Application**
   - Native iOS wrapper using Capacitor
   - Custom native plugins for enhanced performance
   - Native camera and microphone integrations
   - Push notification services
   - App Store payment integration

3. **Android Application**
   - Native Android wrapper using Capacitor
   - Custom native plugins for enhanced performance
   - Optimized for various Android devices
   - Google Play payment integration

### Server Layer

The server layer manages API requests, real-time communication, and admin functionality:

1. **API Server**
   - Node.js + Express backend
   - RESTful API for most operations
   - JWT authentication
   - Rate limiting and security middleware
   - Payment processing
   - User management

2. **WebSocket Server**
   - Real-time messaging
   - Video chat signaling
   - User presence and typing indicators
   - Low-latency updates

3. **Admin Panel**
   - User management and moderation
   - Report handling
   - Analytics dashboard
   - Payment monitoring
   - System configuration

### Feature Modules

1. **Text Chat**
   - Real-time messaging
   - Read receipts
   - Typing indicators
   - Message history
   - Moderation and filtering

2. **Video Chat**
   - WebRTC implementation
   - Adaptive quality based on network conditions
   - Camera and microphone controls
   - Fallback mechanisms for challenging network environments
   - Screen sharing (premium feature)

3. **User Matching**
   - Intelligent matching algorithm
   - Preference-based filtering (gender, location)
   - Queue management
   - Premium matching priority

### Service Integrations

1. **PostgreSQL Database**
   - User data storage
   - Message history
   - Session records
   - Subscription information
   - Analytics data

2. **Firebase Auth**
   - User authentication
   - Anonymous sign-in
   - Identity management
   - Security rules

3. **Payment Processors**
   - Stripe for credit card processing
   - PayPal as alternative payment method
   - Subscription management
   - One-time payments for unban fees
   - Mobile payment integrations

4. **OpenAI**
   - Content moderation
   - Toxicity detection
   - Automated ban triggers for severe violations

## Data Flow

### User Authentication Flow

```
┌─────────┐     ┌────────────┐     ┌─────────────┐     ┌────────────┐
│  User   │────▶│  Firebase  │────▶│ StrangerWave │────▶│ Database   │
│ Browser │◀────│    Auth    │◀────│   Server     │◀────│            │
└─────────┘     └────────────┘     └─────────────┘     └────────────┘
```

1. User initiates authentication (anonymous or registered)
2. Firebase Auth handles the authentication process
3. Firebase returns authentication token
4. Token is validated by StrangerWave server
5. User session is created in database
6. JWT is issued to the client for subsequent requests

### Chat Matching Flow

```
┌─────────┐     ┌─────────────┐     ┌────────────┐     ┌─────────────┐
│  User A │────▶│ WebSocket   │────▶│ Matching   │────▶│   User B    │
│         │◀────│  Server     │◀────│ Algorithm  │◀────│             │
└─────────┘     └─────────────┘     └────────────┘     └─────────────┘
```

1. User A enters the chat queue with preferences
2. Server adds user to matching pool
3. Matching algorithm finds compatible User B
4. WebSocket server notifies both users of match
5. Chat session is established

### Video Chat Flow

```
┌─────────┐                                         ┌─────────────┐
│  User A │◀────────────── WebRTC ─────────────────▶│   User B    │
└─────────┘                                         └─────────────┘
     │                                                     │
     │                                                     │
     ▼                                                     ▼
┌─────────────┐                                     ┌─────────────┐
│ Signaling   │◀───────────────────────────────────▶│ Signaling   │
│ Server      │                                     │ Server      │
└─────────────┘                                     └─────────────┘
```

1. Users establish text chat connection
2. Video chat is initiated by either user
3. Signaling server exchanges SDP offers/answers
4. ICE candidates are exchanged through signaling server
5. Direct peer-to-peer WebRTC connection is established
6. Video and audio streams flow directly between users
7. TURN servers are used as fallback for challenging NAT scenarios

## Technology Stack Details

### Frontend Technologies

- **Framework**: React 18
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query, React Context
- **Routing**: wouter
- **Form Handling**: React Hook Form + zod
- **Animation**: Framer Motion
- **WebRTC**: Native WebRTC APIs
- **WebSocket Client**: Native WebSocket API
- **HTTP Client**: Custom fetch wrapper
- **Mobile Framework**: Capacitor

### Backend Technologies

- **Runtime**: Node.js 18+
- **Framework**: Express
- **Language**: TypeScript
- **API Style**: RESTful
- **Authentication**: JWT + Firebase
- **Database ORM**: Drizzle ORM
- **WebSockets**: ws package
- **Validation**: zod
- **Logging**: Winston
- **Testing**: Jest

### Database Schema

The database uses a normalized relational schema with the following key tables:

- **users**: User accounts and profiles
- **chat_preferences**: User matching preferences
- **chat_sessions**: Record of chat sessions
- **messages**: Chat message history
- **reports**: User reports
- **waiting_queue**: Users waiting for matches
- **subscriptions**: Premium subscription records
- **payments**: Payment transaction records

### Infrastructure Components

- **Web Server**: Node.js application server
- **Database**: PostgreSQL 14+
- **Cache**: Redis (optional for scaling)
- **Media Server**: TURN server for WebRTC fallback
- **CDN**: For static assets
- **Storage**: S3-compatible object storage (optional)
- **Job Queue**: Bull + Redis (for background tasks)

## Scalability Considerations

The StrangerWave architecture is designed for horizontal scalability:

1. **Stateless API Servers**: Can be scaled horizontally behind a load balancer
2. **WebSocket Server Scaling**: Uses Redis for pub/sub to coordinate between instances
3. **Database Scaling**: Supports read replicas and connection pooling
4. **Caching Layer**: Redis can be implemented for high-traffic scenarios
5. **Background Processing**: Long-running tasks are offloaded to worker processes

## Security Architecture

1. **Authentication**: Firebase Auth + JWT tokens with short expiration
2. **Authorization**: Role-based access control
3. **Data Protection**: 
   - TLS encryption for all traffic
   - Data encryption at rest
   - Input validation on all endpoints
4. **API Security**:
   - Rate limiting
   - CORS restrictions
   - CSRF protection
   - HTTP security headers
5. **Content Security**:
   - AI-powered moderation
   - User reporting system
   - Admin review workflow

## Monitoring and Observability

The platform includes built-in monitoring capabilities:

1. **Application Metrics**: CPU, memory, request rates
2. **Business Metrics**: User signups, active sessions, premium conversions
3. **Error Tracking**: Aggregated error reporting
4. **Performance Monitoring**: API response times, WebSocket latency
5. **User Experience Metrics**: Video quality, chat success rates

## Extension Points

The architecture includes several extension points for future development:

1. **Plugin System**: For adding new moderation tools or content filters
2. **API Extensions**: Well-documented internal APIs for new features
3. **Payment Providers**: Modular payment integration system
4. **Mobile Features**: Native plugin architecture for platform-specific features
5. **Analytics Integration**: Hooks for third-party analytics services