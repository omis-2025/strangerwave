#!/bin/bash

# StrangerWave Deployment Preparation Script
# This script prepares the Android project for export and building locally

echo "===== StrangerWave Deployment Preparation ====="
echo "This script will prepare the Android project for local building."

# Ensure the project is built and synced first
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

# Create a tarball of the Android project
echo ""
echo "===== Creating Export Package ====="

# Create a directory for export files
mkdir -p export

# Copy key files needed for Android build
cp -r android export/
cp key.properties export/android/
cp -r keystores export/

# Create a tarball
tar -czf strangerwave-android-export.tar.gz export/

echo ""
echo "===== Export Package Created ====="
echo "Download the file 'strangerwave-android-export.tar.gz' to your local machine."
echo ""
echo "To build locally:"
echo "1. Extract the tarball: tar -xzf strangerwave-android-export.tar.gz"
echo "2. Navigate to the android directory: cd export/android"
echo "3. Run the build command: ./gradlew bundleRelease"
echo "4. The AAB will be at: export/android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "Alternatively, you can open the Android project in Android Studio to build the AAB."