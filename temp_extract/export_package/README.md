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

