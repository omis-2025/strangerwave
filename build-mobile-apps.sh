#!/bin/bash

# StrangerWave Mobile App Build Script
# This script builds the web assets (if needed) and prepares the mobile apps for submission

echo "===== StrangerWave Mobile App Build Script ====="
echo "This script will prepare mobile apps for submission."

# Check if script is run with an argument
if [ "$1" == "android" ] || [ "$1" == "ios" ] || [ "$1" == "both" ]; then
    BUILD_TARGET=$1
else
    echo ""
    echo "Please specify which platform to build for:"
    echo "  ./build-mobile-apps.sh android  - Build only Android app"
    echo "  ./build-mobile-apps.sh ios      - Build only iOS app"
    echo "  ./build-mobile-apps.sh both     - Build both platforms"
    echo ""
    exit 1
fi

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
    
    cd ..
}

# Function to prepare iOS app
prepare_ios() {
    echo ""
    echo "===== Preparing iOS App ====="
    echo "Copying web assets to iOS..."
    npx cap copy ios
    
    echo "Syncing iOS project..."
    npx cap sync ios
    
    echo ""
    echo "iOS project prepared successfully!"
    echo "To open in Xcode and build for submission, run: npx cap open ios"
    echo ""
    echo "In Xcode:"
    echo "1. Set the version and build number"
    echo "2. Select 'Generic iOS Device' as the build target"
    echo "3. Choose Product > Archive"
    echo "4. After archiving, use the Organizer to validate and upload to App Store Connect"
}

# Build process
if [ "$BUILD_TARGET" == "android" ] || [ "$BUILD_TARGET" == "both" ]; then
    # Always build the web app first for Android
    build_web_app
    build_android
fi

if [ "$BUILD_TARGET" == "ios" ] || [ "$BUILD_TARGET" == "both" ]; then
    # Build web app if not already built
    if [ "$BUILD_TARGET" != "android" ]; then
        build_web_app
    fi
    prepare_ios
fi

echo ""
echo "===== Build Process Complete ====="
echo "For more information on app submission:"
echo "- Review docs/app-submission-index.md for all submission documentation"
echo "- Android app store submission: docs/app-store-submission-guide.md"
echo "- iOS certificate setup: docs/apple-certificate-setup.md"
echo ""