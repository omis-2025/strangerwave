# StrangerWave Environment Variables and Secrets Setup Guide

This comprehensive guide details all environment variables and secrets required to deploy and run StrangerWave. Following this guide will ensure proper configuration of all platform components and third-party integrations.

## Overview

StrangerWave requires configuration of several external services:
1. Database (PostgreSQL)
2. Authentication (Firebase)
3. Payment processing (Stripe and PayPal)
4. Content moderation (OpenAI)
5. Core application settings

## Environment Variables Reference

### Required Environment Variables

These environment variables are **required** for basic functionality:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://username:password@host:port/database` |
| `JWT_SECRET` | Secret key for JWT token generation | `your-secure-random-string` |
| `VITE_FIREBASE_API_KEY` | Firebase API key | `AIzaSyC1a8pQ7MHb5tvI...` |
| `VITE_FIREBASE_APP_ID` | Firebase application ID | `1:123456789012:web:abc...` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `strangerwave-prod` |

### Payment Processing Variables

These variables are required for payment functionality:

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_live_51Abc...` |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key | `pk_live_51Abc...` |
| `PAYPAL_CLIENT_ID` | PayPal API client ID | `AYzd1vCU6...` |
| `PAYPAL_CLIENT_SECRET` | PayPal API client secret | `ELzuQr5TxdeATw...` |

### Content Moderation Variables

Required for AI-powered content moderation:

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for content moderation | `sk-Abc123...` |

### Optional Configuration Variables

These variables can be adjusted to modify application behavior:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | Port for the server to listen on | `3000` | `8080` |
| `NODE_ENV` | Environment mode | `development` | `production` |
| `LOG_LEVEL` | Logging verbosity | `info` | `debug`, `warn`, `error` |
| `SESSION_SECRET` | Secret for session cookies | random | `your-session-secret` |
| `CORS_ORIGIN` | Allowed CORS origins | `*` | `https://yourdomain.com` |
| `MAX_UPLOAD_SIZE` | Maximum file upload size (bytes) | `5242880` (5MB) | `10485760` (10MB) |

### WebRTC Configuration Variables

Configure WebRTC for optimal video chat performance:

| Variable | Description | Example |
|----------|-------------|---------|
| `STUN_SERVERS` | Comma-separated list of STUN servers | `stun:stun1.l.google.com:19302,stun:stun2.l.google.com:19302` |
| `TURN_SERVERS` | TURN server URL | `turn:your-turn-server.com:3478` |
| `TURN_USERNAME` | TURN server username | `turnuser` |
| `TURN_CREDENTIAL` | TURN server password | `turnpassword` |

## Setting Up Environment Variables

### Development Environment

For local development, create a `.env` file in the root directory with your environment variables:

```
# Database
DATABASE_URL=postgres://postgres:password@localhost:5432/strangerwave

# Authentication
JWT_SECRET=dev-jwt-secret-change-in-production
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Content Moderation
OPENAI_API_KEY=your-openai-api-key

# Application
NODE_ENV=development
PORT=3000
```

### Production Environment

In production environments, set environment variables according to your hosting platform:

#### Heroku

```bash
heroku config:set DATABASE_URL=postgres://username:password@host:port/database
heroku config:set JWT_SECRET=your-secure-random-string
# Add all other environment variables
```

#### AWS Elastic Beanstalk

Create a `.ebextensions/env.config` file:

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    DATABASE_URL: postgres://username:password@host:port/database
    JWT_SECRET: your-secure-random-string
    # Add all other environment variables
```

#### Docker

In your `docker-compose.yml`:

```yaml
services:
  app:
    image: strangerwave
    environment:
      - DATABASE_URL=postgres://username:password@db:5432/strangerwave
      - JWT_SECRET=your-secure-random-string
      # Add all other environment variables
```

## Obtaining API Keys and Secrets

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Add a web app to your project by clicking the web icon
4. Register the app with a nickname (e.g., "StrangerWave Web")
5. Copy the configuration values for:
   - `apiKey` → `VITE_FIREBASE_API_KEY`
   - `appId` → `VITE_FIREBASE_APP_ID`
   - `projectId` → `VITE_FIREBASE_PROJECT_ID`
6. Enable Authentication in the Firebase console:
   - Go to "Authentication" → "Sign-in method"
   - Enable "Anonymous" sign-in method
7. Add your domain to the authorized domains list:
   - Go to "Authentication" → "Settings" → "Authorized domains"
   - Add your production domain

### Stripe Setup

1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Get your API keys from the Dashboard:
   - Go to [Developers → API Keys](https://dashboard.stripe.com/apikeys)
   - Copy "Publishable key" → `VITE_STRIPE_PUBLIC_KEY`
   - Copy "Secret key" → `STRIPE_SECRET_KEY`
3. Configure webhook endpoints:
   - Go to [Developers → Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://yourdomain.com/api/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### PayPal Setup

1. Create a [PayPal Developer account](https://developer.paypal.com/)
2. Create a new app:
   - Go to [Dashboard → My Apps & Credentials](https://developer.paypal.com/developer/applications/)
   - Click "Create App"
   - Choose a name (e.g., "StrangerWave")
   - Select "Merchant" account type
3. Get your API credentials:
   - Copy "Client ID" → `PAYPAL_CLIENT_ID`
   - Copy "Secret" → `PAYPAL_CLIENT_SECRET`
4. Configure webhook:
   - In your app settings, go to "Webhooks"
   - Add webhook: `https://yourdomain.com/api/paypal/webhook`
   - Select events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

### OpenAI Setup

1. Create an [OpenAI account](https://platform.openai.com/signup)
2. Generate an API key:
   - Go to [API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Provide a name (e.g., "StrangerWave Moderation")
   - Copy the key → `OPENAI_API_KEY`
3. Set up usage limits to control costs:
   - Go to [Usage limits](https://platform.openai.com/account/limits)
   - Set appropriate hard and soft limits

## Secret Management Best Practices

### Development

- Never commit `.env` files or secrets to version control
- Use `.env.sample` as a template (included in the repository)
- Each developer should maintain their own local `.env` file

### Production

- Use environment variable management of your hosting platform
- Rotate secrets regularly (every 30-90 days)
- Use secret manager services when available:
  - AWS: AWS Secrets Manager
  - GCP: Secret Manager
  - Azure: Key Vault

### CI/CD Pipeline

- Store secrets in the CI platform's secure environment variables
- Avoid printing secrets in build logs
- Consider using dedicated secret injection tools in your CI/CD pipeline

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` format is correct
   - Check network access between application and database
   - Confirm database server is running and accessible

2. **Payment Processing Errors**
   - Ensure both Stripe and PayPal credentials are for the same environment (test/live)
   - Verify webhooks are correctly configured
   - Check for API key restrictions that might block requests

3. **Firebase Authentication Issues**
   - Verify domain is added to authorized domains in Firebase console
   - Check that Anonymous authentication is enabled
   - Confirm API key has the necessary permissions

4. **Content Moderation Errors**
   - Verify OpenAI API key is valid and active
   - Check OpenAI API usage limits and billing status
   - Confirm correct model access permissions on the OpenAI key

### Diagnostic Commands

When troubleshooting, these commands can help identify environment variable issues:

```bash
# Print all environment variables (redacted for security)
node -e "console.log(Object.keys(process.env).reduce((obj, key) => { obj[key] = key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD') ? '****' : process.env[key]; return obj; }, {}))"

# Test database connection
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()', (err, res) => { console.log(err ? err : 'Database connection successful!'); pool.end(); });"

# Verify Stripe API key
node -e "const Stripe = require('stripe'); const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); stripe.customers.list({limit: 1}).then(() => console.log('Stripe API key is valid')).catch(err => console.error('Stripe API key error:', err.message));"
```

## Environment Migration Checklist

When migrating between environments (staging → production), follow this checklist:

- [ ] Update all API keys to production versions
- [ ] Update webhook URLs to production endpoints
- [ ] Configure proper CORS settings for production domains
- [ ] Set appropriate logging levels
- [ ] Update database connection strings
- [ ] Test all integrations in the new environment
- [ ] Monitor error logs after deployment for any missed configuration