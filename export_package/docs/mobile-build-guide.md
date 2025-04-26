# StrangerWave Mobile Build Guide

This document provides instructions for building and deploying StrangerWave mobile applications for Android and iOS platforms.

## Building with GitHub Actions

We've configured GitHub Actions workflows to automatically build the Android and iOS applications. This approach allows you to get working builds without setting up a local development environment.

### Prerequisites

1. Push your code to a GitHub repository
2. Ensure your repository has the `.github/workflows` directory with the workflow files

### Android Build Process

The Android build workflow (`android-build.yml`) automatically:

1. Sets up the Java and Node.js environment
2. Installs project dependencies
3. Builds the web application
4. Copies and syncs web assets to the Android project
5. Builds a debug APK
6. Uploads the APK as a build artifact

### iOS Build Process

The iOS build workflow (`ios-build.yml`) automatically:

1. Sets up a macOS environment with Node.js
2. Installs project dependencies
3. Builds the web application
4. Copies and syncs web assets to the iOS project
5. Installs CocoaPods dependencies
6. Builds the iOS app for the simulator
7. Uploads the build as an artifact

### Accessing Build Artifacts

1. Go to your GitHub repository
2. Navigate to the "Actions" tab
3. Click on the completed workflow run
4. Scroll down to the "Artifacts" section
5. Download the artifact (app-debug.apk for Android or ios-debug-build for iOS)

## TestFlight Distribution (iOS)

To distribute your iOS app via TestFlight:

1. You need to add signing configuration to the GitHub workflow
2. Provide Apple Developer account credentials as GitHub secrets
3. Add TestFlight upload steps to the workflow

Example TestFlight configuration to add to the iOS workflow:

```yaml
- name: Import Certificate
  uses: apple-actions/import-codesign-certs@v1
  with:
    p12-file-base64: ${{ secrets.CERTIFICATES_P12 }}
    p12-password: ${{ secrets.CERTIFICATES_P12_PASSWORD }}
    keychain-password: ${{ secrets.KEYCHAIN_PASSWORD }}

- name: Build and Archive
  run: |
    cd ios/App
    xcodebuild archive -workspace App.xcworkspace -scheme App -configuration Release -archivePath App.xcarchive

- name: Export IPA
  run: |
    cd ios/App
    xcodebuild -exportArchive -archivePath App.xcarchive -exportOptionsPlist ExportOptions.plist -exportPath ./build

- name: Upload to TestFlight
  uses: apple-actions/upload-testflight-build@v1
  with:
    app-path: ios/App/build/App.ipa
    issuer-id: ${{ secrets.APPSTORE_ISSUER_ID }}
    api-key-id: ${{ secrets.APPSTORE_API_KEY_ID }}
    api-private-key: ${{ secrets.APPSTORE_API_PRIVATE_KEY }}
```

### Required Secrets for TestFlight

You'll need to add these secrets to your GitHub repository:

- `CERTIFICATES_P12`: Base64-encoded P12 certificate file
- `CERTIFICATES_P12_PASSWORD`: Password for the P12 file
- `KEYCHAIN_PASSWORD`: Password for the temporary keychain
- `APPSTORE_ISSUER_ID`: App Store Connect API Issuer ID
- `APPSTORE_API_KEY_ID`: App Store Connect API Key ID
- `APPSTORE_API_PRIVATE_KEY`: App Store Connect API Private Key

## Google Play Store Distribution (Android)

To distribute your Android app via Google Play:

1. Generate a signed APK or AAB (Android App Bundle)
2. Add Google Play deployment steps to the workflow

Example Google Play configuration to add to the Android workflow:

```yaml
- name: Build Release AAB
  run: cd android && ./gradlew bundleRelease

- name: Sign AAB
  uses: r0adkll/sign-android-release@v1
  with:
    releaseDirectory: android/app/build/outputs/bundle/release
    signingKeyBase64: ${{ secrets.ANDROID_SIGNING_KEY }}
    alias: ${{ secrets.ANDROID_ALIAS }}
    keyStorePassword: ${{ secrets.ANDROID_KEY_STORE_PASSWORD }}
    keyPassword: ${{ secrets.ANDROID_KEY_PASSWORD }}

- name: Deploy to Play Store
  uses: r0adkll/upload-google-play@v1
  with:
    serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}
    packageName: com.strangerwave.app
    releaseFiles: android/app/build/outputs/bundle/release/app-release.aab
    track: internal
```

### Required Secrets for Google Play

You'll need to add these secrets to your GitHub repository:

- `ANDROID_SIGNING_KEY`: Base64-encoded keystore file
- `ANDROID_ALIAS`: Keystore alias
- `ANDROID_KEY_STORE_PASSWORD`: Keystore password
- `ANDROID_KEY_PASSWORD`: Key password
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: Google Play service account JSON file content

## Local Testing

### Android

1. Download the APK from GitHub Actions artifacts
2. Transfer the APK to your Android device 
3. Install and test the application

### iOS

For iOS simulator testing:
1. Download the iOS build artifact from GitHub Actions
2. Extract and open the .app file on a Mac with Xcode installed

For device testing, you'll need to use TestFlight as described above.