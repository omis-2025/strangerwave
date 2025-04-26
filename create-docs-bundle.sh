#!/bin/bash

# StrangerWave Documentation and Android Project Bundle Creator
# This script packages the existing built Android project and documentation for export

echo "===== Creating StrangerWave Documentation and Android Project Bundle ====="

# Create export directory
mkdir -p export_package

# Copy essential documentation
echo "Copying documentation files..."
cp -r docs export_package/
cp privacy-policy.html export_package/
cp terms-of-service.html export_package/
cp executive-summary.html export_package/
cp financial-projections.html export_package/
cp technical-architecture.html export_package/
cp growth-strategy-and-roadmap.html export_package/
cp competitor-analysis.html export_package/

# Copy Android project files
echo "Copying Android project files..."
cp -r android export_package/
if [ -f "key.properties" ]; then
  cp key.properties export_package/
fi
cp -r keystores export_package/

# Create README with instructions
cat > export_package/README.md << 'EOL'
# StrangerWave App Deployment Package

This package contains everything needed to build and deploy the StrangerWave app.

## Contents

- **android/** - The Android project directory
- **docs/** - Complete documentation for the project
- **keystores/** - Android keystore files for signing the app
- Various HTML documents (privacy policy, terms of service, etc.)

## Building the Android App Bundle (AAB)

### Prerequisites
- Android Studio or Android SDK with Gradle
- Java Development Kit (JDK) 11+

### Steps to Build:

1. Open a terminal and navigate to the android directory:
   ```
   cd android
   ```

2. Make sure the key.properties file is in the android directory (copy it from the root if needed)

3. Run the Gradle build command:
   ```
   ./gradlew bundleRelease
   ```
   
   If you're on Windows, use:
   ```
   gradlew.bat bundleRelease
   ```

4. The AAB file will be generated at:
   ```
   app/build/outputs/bundle/release/app-release.aab
   ```

5. This file can be uploaded directly to the Google Play Store.

## Documentation

The docs directory contains all the necessary documentation for the project, including:
- App store submission guide
- Executive summary for acquirers
- Technical architecture
- Financial projections
- And more

EOL

# Create zip file with everything
echo "Creating zip archive..."
zip -r strangerwave-deployment-package.zip export_package

echo ""
echo "===== Bundle Creation Complete ====="
echo "Download the file 'strangerwave-deployment-package.zip'"
echo "This contains all the documentation and Android project files needed to build the AAB."
echo ""