#!/bin/bash

# Modified StrangerWave Mobile App Build Script with automatic "yes" responses
# This script builds the web assets and prepares the Android app for submission

echo "===== StrangerWave Android App Build Script (Automated) ====="
echo "This script will build the web app and prepare the Android app for submission."

# Function to build the web app
build_web_app() {
    echo ""
    echo "===== Building Web App ====="
    echo "Building production version of the web app..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Web build failed. Exiting."
        exit 1
    fi
    
    echo "Web app built successfully!"
}

# Function to build Android app
build_android() {
    echo ""
    echo "===== Building Android App ====="
    echo "Copying web assets to Android..."
    npx cap copy android
    
    echo "Syncing Android project..."
    npx cap sync android
    
    echo "Automatically building Android APK/AAB..."
    
    echo "Building Android App Bundle (AAB)..."
    cd android && ./gradlew bundleRelease
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Android build failed."
        cd ..
        exit 1
    fi
    
    echo ""
    echo "Android App Bundle (AAB) built successfully!"
    echo "Location: android/app/build/outputs/bundle/release/app-release.aab"
    
    echo "Building Android APK..."
    ./gradlew assembleRelease
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Android APK build failed."
        cd ..
        exit 1
    fi
    
    echo ""
    echo "Android APK built successfully!"
    echo "Location: android/app/build/outputs/apk/release/app-release.apk"
    
    cd ..
}

# Build process
build_web_app
build_android

echo ""
echo "===== Build Process Complete ====="
echo "For more information on app submission:"
echo "- Review docs/app-submission-index.md for all submission documentation"
echo "- Android app store submission: docs/app-store-submission-guide.md"
echo ""