#!/bin/bash

# StrangerWave Mobile Sync Script
# This script builds the web app and syncs it with mobile platforms

echo "🔄 StrangerWave Mobile Sync"
echo "=========================="

# Build the web app
echo "📦 Building web application..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Web build failed. Aborting."
  exit 1
fi

echo "✅ Web build completed successfully."

# Copy to Android platform
echo "📱 Syncing with Android platform..."
npx cap copy android
npx cap sync android

if [ $? -ne 0 ]; then
  echo "❌ Android sync failed."
  exit 1
fi

echo "✅ Android sync completed successfully."

# Copy to iOS platform
echo "📱 Syncing with iOS platform..."
npx cap copy ios
npx cap sync ios

if [ $? -ne 0 ]; then
  echo "❌ iOS sync failed."
  exit 1
fi

echo "✅ iOS sync completed successfully."

echo "🎉 Mobile sync process completed!"
echo ""
echo "Next steps:"
echo "  - For Android: cd android && ./gradlew assembleDebug"
echo "  - For iOS: cd ios/App && pod install && open App.xcworkspace"
echo ""
echo "Alternatively, use the GitHub Actions workflows to build the apps automatically."