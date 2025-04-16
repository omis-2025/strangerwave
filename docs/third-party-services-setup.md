# StrangerWave: Third-Party Services Setup Guide

This document provides step-by-step instructions for setting up all third-party services required for the StrangerWave application. Follow these instructions carefully to ensure proper functionality of authentication, payments, and other features.

## Table of Contents
1. [Firebase Setup](#firebase-setup)
2. [Stripe Integration](#stripe-integration)
3. [PayPal Integration](#paypal-integration)
4. [PostgreSQL Database](#postgresql-database)
5. [Environment Variables](#environment-variables)

---

## Firebase Setup

Firebase provides authentication services for StrangerWave.

### Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Provide a name for your project (e.g., "StrangerWave")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

### Step 2: Set Up Firebase Authentication

1. In your Firebase project, go to the "Authentication" section
2. Click on the "Sign-in method" tab
3. Enable the "Anonymous" sign-in provider (required)
4. Optionally enable Google or other providers if you want to expand login options

### Step 3: Register Your Web Application

1. From the Firebase project overview page, click on the web icon (</>) to add a web app
2. Register your app with a nickname (e.g., "StrangerWave Web")
3. Check "Also set up Firebase Hosting" if you plan to use it
4. Click "Register app"
5. You'll be shown your Firebase configuration. Note the following values:
   - `apiKey`
   - `projectId`
   - `appId`

### Step 4: Add Your Domain to Authorized Domains

1. In the Firebase console, go to "Authentication" → "Settings" → "Authorized domains"
2. Add your application domain(s) where the app will be hosted
3. During development, make sure to add your development domain

---

## Stripe Integration

Stripe handles premium subscriptions and the payment system for unbanning.

### Step 1: Create a Stripe Account

1. Go to [Stripe's website](https://stripe.com/) and sign up for an account
2. Complete the account verification process

### Step 2: Get API Keys

1. In your Stripe Dashboard, go to "Developers" → "API keys"
2. You'll need two keys:
   - **Publishable key** (`VITE_STRIPE_PUBLIC_KEY`): Starts with `pk_`
   - **Secret key** (`STRIPE_SECRET_KEY`): Starts with `sk_`
   - For testing, use the test mode keys
   - For production, switch to live mode keys

### Step 3: Set Up Products and Prices

1. Go to "Products" in your Stripe Dashboard
2. Create the following products:
   
   **Premium Subscription**
   - Name: "StrangerWave Premium"
   - Description: "Priority matching, advanced filters, and quality controls"
   - Price: $2.99/month (recurring)
   - Note the `price_id` after creation
   
   **Unban Fee**
   - Name: "StrangerWave Unban Fee"
   - Description: "One-time payment to remove account ban"
   - Price: $10.99 (one-time)
   - Note the `price_id` after creation

### Step 4: Configure Webhook (For Production)

1. Go to "Developers" → "Webhooks" in the Stripe Dashboard
2. Add an endpoint URL: `https://your-domain.com/api/webhook`
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Get the webhook signing secret and save it as `STRIPE_WEBHOOK_SECRET`

---

## PayPal Integration

PayPal provides an alternative payment method for users.

### Step 1: Create a PayPal Developer Account

1. Go to the [PayPal Developer Portal](https://developer.paypal.com/) and sign up
2. Log in to the Developer Dashboard

### Step 2: Create a PayPal App

1. Go to "My Apps & Credentials"
2. Select "Create App" under "REST API apps"
3. Name your application (e.g., "StrangerWave")
4. Select "Merchant" as the app type
5. Click "Create App"

### Step 3: Get API Credentials

1. Once your app is created, you'll see your credentials
2. For development, use the Sandbox credentials
3. For production, use the Live credentials
4. Save the following:
   - **Client ID** (`PAYPAL_CLIENT_ID`)
   - **Secret** (`PAYPAL_CLIENT_SECRET`)

### Step 4: Configure PayPal Webhook (For Production)

1. In your app details, go to the "Webhooks" section
2. Click "Add Webhook"
3. Enter your webhook URL: `https://your-domain.com/api/paypal/webhook`
4. Select these events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`

---

## PostgreSQL Database

StrangerWave uses PostgreSQL for data storage.

### Step 1: Set Up PostgreSQL Database

1. For development, you can use a local PostgreSQL instance
2. For production, consider a managed service like:
   - [Neon](https://neon.tech/) (Recommended - Serverless PostgreSQL)
   - [Amazon RDS](https://aws.amazon.com/rds/postgresql/)
   - [DigitalOcean Managed Databases](https://www.digitalocean.com/products/managed-databases-postgresql)
   - [Heroku Postgres](https://www.heroku.com/postgres)

3. Create a new PostgreSQL database for your application

### Step 2: Get Connection Information

Note down the following database connection details:
- Host (`PGHOST`)
- Port (`PGPORT`)
- Database name (`PGDATABASE`)
- Username (`PGUSER`)
- Password (`PGPASSWORD`)
- Connection string (`DATABASE_URL`)

The connection string format is:
```
postgresql://username:password@host:port/database
```

---

## Environment Variables

After setting up all the services, you'll need to configure the following environment variables:

| Variable | Description | Source |
|----------|-------------|--------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | Firebase Console |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | Firebase Console |
| `DATABASE_URL` | PostgreSQL connection string | Database provider |
| `PGHOST` | PostgreSQL host | Database provider |
| `PGPORT` | PostgreSQL port | Database provider |
| `PGDATABASE` | PostgreSQL database name | Database provider |
| `PGUSER` | PostgreSQL username | Database provider |
| `PGPASSWORD` | PostgreSQL password | Database provider |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key | Stripe Dashboard |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Stripe Dashboard |
| `PAYPAL_CLIENT_ID` | PayPal client ID | PayPal Developer Dashboard |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret | PayPal Developer Dashboard |

### Setting up Environment Variables

#### Development Environment
Create a `.env` file in the root directory of the project with all the variables listed above.

#### Production Environment
Configure these variables in your hosting provider's environment variables section. Never commit `.env` files to your repository.

---

## Testing the Integration

After setting up all services, you should test each integration:

1. **Firebase Authentication**: Test anonymous login functionality
2. **Stripe Payments**: Make test purchases using [Stripe test cards](https://stripe.com/docs/testing#cards)
3. **PayPal Payments**: Use [PayPal sandbox accounts](https://developer.paypal.com/tools/sandbox/accounts/) to test payments
4. **Database**: Verify that user data is being stored correctly

---

## Troubleshooting Common Issues

### Firebase Authentication Issues
- Ensure your domain is added to the authorized domains list
- Check browser console for CORS errors
- Verify that the Firebase configuration is correctly set up

### Payment Processing Issues
- For Stripe, ensure you're using the correct keys (test vs. live)
- For PayPal, confirm your sandbox/live environment is configured correctly
- Verify webhook endpoints are correctly set up and accessible

### Database Connection Issues
- Check connection string format
- Ensure database user has appropriate permissions
- Verify that your hosting provider allows outbound connections to your database

---

For further assistance, contact the StrangerWave support team or refer to the official documentation of each service provider.