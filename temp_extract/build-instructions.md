# StrangerWave Android App Bundle (AAB) Build Instructions

This document provides detailed instructions for building the StrangerWave Android App Bundle (AAB) for Google Play Store submission.

## Prerequisites

Before you begin, make sure you have the following installed:

- Java JDK 11 or higher
- Android SDK (API level 33 or higher)
- Gradle 7.x or higher
- At least 4GB of RAM and 10GB of free disk space

## Build Steps

1. **Extract the deployment package**
   ```
   tar -xzf strangerwave-deployment-package.tar.gz
   ```
   
2. **Navigate to the Android project directory**
   ```
   cd export_package/android
   ```
   
3. **Make Gradle executable (Mac/Linux only)**
   ```
   chmod +x gradlew
   ```
   
4. **Build the App Bundle**
   - On Mac/Linux:
     ```
     ./gradlew bundleRelease
     ```
   - On Windows:
     ```
     gradlew.bat bundleRelease
     ```
     
5. **Locate the AAB file**
   
   After the build completes successfully, you'll find the AAB file at:
   ```
   app/build/outputs/bundle/release/app-release.aab
   ```

## Troubleshooting

### Memory Issues
If you encounter memory errors during the build process, try increasing the Gradle memory allocation by adding or modifying this line in `gradle.properties`:
```
org.gradle.jvmargs=-Xmx2048m
```

### Build Errors
- Make sure you have the correct Android SDK version installed
- Check that your JAVA_HOME environment variable is set correctly
- Ensure all dependencies are properly resolved

### Keystore Information
The keystore is already included in the package and properly referenced in the `key.properties` file, which is automatically loaded by the build.gradle script.

**Key Properties:**
- Keystore path: `../keystores/strangerwave.keystore`
- Keystore password: `strangerwave123`
- Key alias: `strangerwave`
- Key password: `strangerwave123`

**Note:** If you need to use your own keystore, simply replace the `strangerwave.keystore` file in the `keystores` directory and update the `key.properties` file with your keystore details.

### Permission Issues
If you encounter permission issues with gradlew, make sure to run:
```
chmod +x gradlew
```

## Google Play Store Submission

Once you have the AAB file, you can upload it to the Google Play Console:

1. Log in to your Google Play Console account
2. Navigate to your StrangerWave app
3. Go to "Release" > "Production" (or your desired track)
4. Click "Create new release"
5. Upload the AAB file
6. Complete the release information and submit for review

Remember that Google Play Store requires all new apps to use the Android App Bundle format rather than the older APK format.