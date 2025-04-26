#!/bin/bash

# StrangerWave Android Build Script - With Auto-Confirmation
# This script uses 'yes' to automatically confirm any prompts during the build process

echo "===== StrangerWave Android Build Script with Auto-Confirmation ====="
echo "Using 'yes' to bypass any prompts during the build..."

# Make sure our other script is executable
chmod +x build-android-auto.sh

# Run the build script with 'yes' to automatically answer any prompts
yes | ./build-android-auto.sh > build-yes-log.txt 2>&1

echo "Build process has been initiated in the background."
echo "Build output is being logged to build-yes-log.txt"
echo "Check the log for progress. You can monitor it with: tail -f build-yes-log.txt"
echo ""
echo "After the build completes, the AAB should be at: android/app/build/outputs/bundle/release/app-release.aab"
echo "A copy will also be placed at: strangerwave-release.aab"