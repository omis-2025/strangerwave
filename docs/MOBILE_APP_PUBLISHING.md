# StrangerWave Mobile App Publishing Guide

This guide provides step-by-step instructions for publishing StrangerWave to the Apple App Store and Google Play Store.

## Prerequisites

1. **Apple Developer Account** - $99/year for individuals at [developer.apple.com](https://developer.apple.com)
2. **Google Play Developer Account** - $25 one-time fee at [play.google.com/console](https://play.google.com/console)
3. **Capacitor Setup** - Already configured in this project
4. **macOS Computer** - Required for iOS app building

## Building the App with Capacitor

### 1. Initial Setup

Make sure all dependencies are installed:

```bash
npm install
```

### 2. Initialize Capacitor

If not already done, initialize Capacitor:

```bash
npx cap init StrangerWave com.strangerwave.app
```

### 3. Build the Web App

```bash
npm run build
```

### 4. Add Platforms

```bash
# Add Android
npx cap add android

# Add iOS
npx cap add ios
```

### 5. Copy Web Code to Native Platforms

```bash
npx cap copy
```

### 6. Update Native Projects

```bash
npx cap update
```

## iOS Specific Configuration

### 1. Open Xcode Project

```bash
npx cap open ios
```

### 2. App Configuration in Xcode

1. Select your project in the Project Navigator
2. Select the "StrangerWave" target
3. Update the following:
   - Display Name: StrangerWave
   - Bundle Identifier: com.strangerwave.app
   - Version: 1.0.0
   - Build: 1

### 3. App Store Required Configurations

1. **App Icons** - Located in `App/App/Assets.xcassets/AppIcon.appiconset`
   - Use [MakeAppIcon](https://makeappicon.com/) or similar tools to generate icons
   - Required sizes: 1024x1024 (App Store), 180x180, 120x120, 87x87, etc.

2. **Launch Screen** - Configure in `App/App/Base.lproj/LaunchScreen.storyboard`
   - Add your logo and a background that matches your app theme

3. **Camera & Microphone Permissions**
   - Edit `Info.plist` to include:
     - `NSCameraUsageDescription` - "StrangerWave needs camera access for video chat"
     - `NSMicrophoneUsageDescription` - "StrangerWave needs microphone access for audio chat"

4. **App Transport Security**
   - For production, ensure `NSAllowsArbitraryLoads` is set to `NO` in `Info.plist`
   - Configure specific domain exceptions as needed

### 4. Building for Distribution

1. **Register App ID and Certificates**
   - Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
   - Create an App ID with the Bundle Identifier
   - Create Distribution Certificate

2. **Create Provisioning Profile**
   - Go to [Profiles section](https://developer.apple.com/account/resources/profiles/list)
   - Create an App Store Distribution profile for your App ID

3. **Archive for Distribution**
   - In Xcode: Product > Archive
   - In Archive window: Distribute App > App Store Connect > Upload

## Android Specific Configuration

### 1. Open Android Studio Project

```bash
npx cap open android
```

### 2. App Configuration in Android Studio

1. Open `android/app/build.gradle`
   - Update `applicationId` to "com.strangerwave.app"
   - Set `versionCode` to 1
   - Set `versionName` to "1.0.0"

2. Update app name in `android/app/src/main/res/values/strings.xml`
   - Change `app_name` to "StrangerWave"

### 3. Play Store Required Configurations

1. **App Icons**
   - Located in `android/app/src/main/res/mipmap-*`
   - Use Android Studio's Image Asset Studio to generate icons
   - Required for multiple densities: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi

2. **Splash Screen**
   - Configure in `android/app/src/main/res/drawable/splash.xml`
   - Make sure background color matches your theme

3. **Permissions**
   - Check `android/app/src/main/AndroidManifest.xml` has:
     - `<uses-permission android:name="android.permission.CAMERA" />`
     - `<uses-permission android:name="android.permission.RECORD_AUDIO" />`
     - `<uses-permission android:name="android.permission.INTERNET" />`

### 4. Building for Distribution

1. **Create Keystore for Signing**
   ```bash
   keytool -genkey -v -keystore strangerwave-key.keystore -alias strangerwave -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Gradle for Signing**
   - Create or edit `android/key.properties` (add to .gitignore):
   ```
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=strangerwave
   storeFile=/path/to/strangerwave-key.keystore
   ```

3. **Update build.gradle**
   - Edit `android/app/build.gradle` to include signing configuration

4. **Generate AAB**
   - In Android Studio: Build > Generate Signed Bundle / APK
   - Choose Android App Bundle
   - Fill in keystore details
   - Choose release build variant

## Mobile App Store Submission

### Apple App Store

1. **Create App in App Store Connect**
   - Go to [App Store Connect](https://appstoreconnect.apple.com/)
   - My Apps > + > New App
   - Fill in app information:
     - Platform: iOS
     - Name: StrangerWave
     - Primary language: English
     - Bundle ID: Select from dropdown
     - SKU: com.strangerwave.app

2. **App Information**
   - Fill out all required metadata:
     - Privacy Policy URL
     - App Store category (Social Networking)
     - Age Rating (17+) - **VERY IMPORTANT**
     - App Store screenshots (multiple device sizes)
     - Promotional text and description
     - Keywords

3. **IAP Configuration**
   - If offering in-app purchases or subscriptions:
     - Create products in App Store Connect
     - Add details for review/approval

4. **TestFlight Setup** (Optional but recommended)
   - Enable TestFlight testing
   - Add internal and external testers
   - Submit for beta review

5. **Submit for Review**
   - Complete App Review Information
   - Provide demo account if app requires login
   - Submit for Review

### Google Play Store

1. **Create App in Play Console**
   - Go to [Play Console](https://play.google.com/console)
   - All applications > Create application
   - Enter app name: StrangerWave
   - Create app

2. **Store Listing**
   - Complete all required fields:
     - Short description (80 characters)
     - Full description (4000 characters)
     - Screenshots and feature graphic
     - App category (Social)
     - Contact details
     - Privacy policy URL

3. **Content Rating**
   - Complete content rating questionnaire
   - Make sure to set adult-only (18+) rating

4. **Pricing & Distribution**
   - Set as Free or Paid
   - Select countries for distribution

5. **Play Billing Setup** (For IAPs)
   - Create in-app products or subscriptions
   - Configure pricing for each product

6. **App Release**
   - Choose release track (Production, Internal testing, etc.)
   - Upload your signed AAB
   - Review and rollout

## Age Verification & Requirements

Both app stores require proper age verification for adult content apps:

1. **Strong Age Gate**
   - Already implemented in AgeVerificationModal.tsx
   - Ensures user confirms they are 18+
   - Stores verification date

2. **App Store Content Rating**
   - Apple: 17+ rating
   - Google Play: Adult rating (18+)

3. **App Description**
   - Clearly state "For adults 18+" in description
   - Include content warnings about potential mature content

4. **Terms and Privacy Policy**
   - Clearly state age requirements
   - Detail data collection practices

## Compliance Requirements

### Apple App Store Review Guidelines

1. **User-Generated Content Guidelines**
   - Detail your content moderation practices
   - Be ready to explain your AI moderation system

2. **Chat App Requirements**
   - Provide method to report offensive content
   - Include privacy policy explaining data usage

3. **Payment Compliance**
   - Use only Apple's in-app purchase for digital goods
   - No links to external purchase methods

### Google Play Policy Requirements

1. **User-Generated Content Policy**
   - Implement robust content moderation
   - Provide reporting mechanisms

2. **Sensitive Content Restrictions**
   - Clear 18+ age gate
   - No sexually explicit content allowed

3. **Payments Policy**
   - Use Google Play Billing for in-app purchases
   - No promotion of alternative payment methods

## Post-Submission

1. **Prepare for Rejection**
   - App stores often reject chat apps on first submission
   - Be ready to clarify moderation practices and content policies

2. **Analytics Integration**
   - Track app usage, crashes, and user engagement

3. **Updates Planning**
   - Maintain a roadmap for improvements
   - Regular updates improve store ranking

## Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Program Policies](https://play.google.com/about/developer-content-policy/)
- [Capacitor Documentation](https://capacitorjs.com/docs)