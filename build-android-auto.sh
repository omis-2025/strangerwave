#!/bin/bash

# StrangerWave Android Build Script - Automated Version
# This script focuses solely on building the Android App Bundle without prompts

echo "===== StrangerWave Android AAB Build Script ====="
echo "This script will build the Android App Bundle (AAB) for StrangerWave."

# Ensure web assets are built first
echo ""
echo "===== Building Web App ====="
echo "Building production version of the web app..."
npm run build

if [ $? -ne 0 ]; then
    echo "ERROR: Web build failed. Exiting."
    exit 1
fi

echo "Web app built successfully!"

# Copy and sync to Android
echo ""
echo "===== Preparing Android App ====="
echo "Copying web assets to Android..."
npx cap copy android

echo "Syncing Android project..."
npx cap sync android

# Build the AAB
echo ""
echo "===== Building Android App Bundle ====="
echo "This may take several minutes. Please wait..."

cd android && ./gradlew bundleRelease --console=plain

# Check build status
if [ $? -ne 0 ]; then
    echo "ERROR: Android build failed."
    cd ..
    exit 1
fi

echo ""
echo "===== Build Process Complete ====="
echo "Android App Bundle (AAB) should be available at:"
echo "android/app/build/outputs/bundle/release/app-release.aab"

# Check if the file was actually created
if [ -f "app/build/outputs/bundle/release/app-release.aab" ]; then
    echo "✅ AAB file successfully created!"
    # Copy to root directory for easier access
    cp app/build/outputs/bundle/release/app-release.aab ../strangerwave-release.aab
    echo "AAB file copied to project root: strangerwave-release.aab"
else
    echo "⚠️ AAB file not found at the expected location."
    echo "Check for errors in the build process."
fi

cd ..
echo ""
echo "Build process completed."