#!/bin/bash

# StrangerWave Deployment Preparation Script
# This script helps ensure your environment is properly configured for deployment

echo "===== StrangerWave Deployment Preparation ====="
echo "Checking for required database environment variables..."

# Required environment variables
REQUIRED_VARS=(
  "DATABASE_URL"
  "PGUSER" 
  "PGPASSWORD" 
  "PGDATABASE" 
  "PGHOST" 
  "PGPORT"
  "STRIPE_SECRET_KEY"
  "VITE_STRIPE_PUBLIC_KEY"
  "VITE_FIREBASE_PROJECT_ID"
  "VITE_FIREBASE_API_KEY"
  "VITE_FIREBASE_APP_ID"
)

MISSING=0

# Check if variables are set
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    echo "❌ $VAR is not set"
    MISSING=$((MISSING+1))
  else
    echo "✅ $VAR is set"
  fi
done

# Summary
if [ $MISSING -eq 0 ]; then
  echo "✅ All required environment variables are set."
else
  echo "❌ $MISSING environment variable(s) missing."
  echo "Make sure these variables are properly set in your Replit Secrets."
fi

# Sync deployment secrets instruction
echo ""
echo "===== Deployment Instructions ====="
echo "1. In Replit, click on 'Secrets' in the Tools panel"
echo "2. For each secret, make sure to sync it with deployment:"
echo "   - Click on the '...' menu next to each secret"
echo "   - Select 'Sync with deployment'"
echo ""
echo "3. When ready to deploy:"
echo "   - Click on the 'Deploy' button at the top of your Replit workspace"
echo "   - This will deploy your app with all the synced environment variables"
echo ""
echo "4. After deploying, add your deployed domain to Firebase authorized domains"
echo "   - Go to Firebase Console > Authentication > Settings"
echo "   - Add your '[app-name].replit.app' domain to authorized domains"
echo ""

echo "===== Database Migration Check ====="
# Check if database migrations are in sync
if command -v npm &> /dev/null; then
  echo "Running database migration check..."
  npm run db:check
  if [ $? -eq 0 ]; then
    echo "✅ Database schema is in sync"
  else
    echo "❌ Database schema needs migration. Run 'npm run db:push' before deploying."
  fi
else
  echo "⚠️ npm not available, skipping database migration check"
fi

echo ""
echo "===== Deployment Readiness ====="
# Check if the app is running locally
if nc -z localhost 5000 >/dev/null 2>&1; then
  echo "✅ App is running locally on port 5000"
else
  echo "❌ App is NOT running locally. Start it with 'npm run dev' before deploying."
fi

echo ""
echo "When all checks are green, your app is ready for deployment!"
echo ""