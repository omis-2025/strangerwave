# StrangerWave: App Store Preparation Guide

This document provides comprehensive instructions for preparing StrangerWave for submission to the Apple App Store and Google Play Store.

## Required Assets

### App Icons

All icons have been prepared in the `/public/app-icons` directory with the following specifications:

#### iOS App Icons
- App Store Icon: 1024×1024 px (marketing icon)
- iPhone App Icon: 180×180 px (60pt @3x)
- iPhone App Icon: 120×120 px (60pt @2x)
- iPad App Icon: 167×167 px (83.5pt @2x)
- iPad App Icon: 152×152 px (76pt @2x)
- iOS Settings Icon: 87×87 px (29pt @3x)
- iOS Settings Icon: 58×58 px (29pt @2x)
- iOS Spotlight Icon: 120×120 px (40pt @3x)
- iOS Spotlight Icon: 80×80 px (40pt @2x)
- iOS Notification Icon: 60×60 px (20pt @3x)
- iOS Notification Icon: 40×40 px (20pt @2x)

#### Android App Icons
- Play Store Icon: 512×512 px (marketing icon)
- Android Icon: 192×192 px (xxxhdpi)
- Android Icon: 144×144 px (xxhdpi)
- Android Icon: 96×96 px (xhdpi)
- Android Icon: 72×72 px (hdpi)
- Android Icon: 48×48 px (mdpi)
- Android Adaptive Icon Foreground: 432×432 px
- Android Adaptive Icon Background: 432×432 px

### Screenshots

Screenshots have been prepared in the `/public/app-screenshots` directory with the following specifications:

#### iOS Screenshots
- iPhone 6.5" Display (1242×2688 px): 3 screenshots
- iPhone 5.5" Display (1242×2208 px): 3 screenshots 
- iPad Pro 12.9" Display (2048×2732 px): 3 screenshots
- iPad 10.5" Display (1668×2224 px): 3 screenshots

#### Android Screenshots
- Phone 7" (1080×1920 px): 3 screenshots
- Phone 10" (1200×1920 px): 3 screenshots
- Tablet 7" (1080×1920 px): 3 screenshots
- Tablet 10" (1200×1920 px): 3 screenshots

### Feature Graphic (Google Play)
- Feature Graphic: 1024×500 px

## App Store Metadata

### App Information

#### App Name
- Full Name: StrangerWave - Anonymous Chat & Video
- Short Name: StrangerWave

#### App Description

**Short Description (Google Play, 80 characters)**
Connect with new people worldwide through text and video chat in a safe environment.

**Full Description (500+ characters)**
StrangerWave redefines anonymous chat with premium features and unmatched safety. Connect with people from around the world through crystal-clear video and text chat.

Key Features:
• HD Video Chat: Enjoy smooth video communication with adaptive quality
• Global Connections: Meet people from different countries and cultures
• Smart Matching: Find like-minded individuals based on your preferences
• Advanced Safety: AI-powered moderation to ensure a safe environment
• Multiple Languages: Connect across language barriers
• Premium Experience: Optional subscription for enhanced features

StrangerWave is exclusively for users 18 years and older. Our platform is designed for meaningful conversations in a respectful environment.

Subscriptions:
• Premium ($2.99/month): HD video, advanced filters, no ads
• VIP ($7.99/month): Priority matching, ultra HD video, special features
• Payments will be charged to your App Store/Google Play account
• Subscriptions automatically renew unless auto-renew is turned off
• Privacy policy: https://strangerwave.com/privacy
• Terms of use: https://strangerwave.com/terms

#### Keywords
video chat, anonymous chat, random chat, omegle alternative, chatroulette, make friends, global connections, video call, strangers, language exchange, international chat, safe chat

#### Category
- Primary: Social Networking
- Secondary: Communication

### Content Rating

#### Age Rating
- Apple: 17+
- Google Play: Mature (18+)

#### Content Descriptors
- Mature/Suggestive Themes
- User-Generated Content
- Unrestricted Web Access

### Privacy Policy

A comprehensive privacy policy is available at `/docs/legal/privacy-policy.md`

This document covers:
- Data collection practices
- User information usage
- Third-party services
- User rights and controls
- Compliance with GDPR, CCPA, and other regulations

### Terms of Service

Complete terms of service are available at `/docs/legal/terms-of-service.md`

This document covers:
- User responsibilities
- Prohibited activities
- Content policies
- Subscription terms
- Termination conditions

## Technical Requirements

### iOS Specific Requirements

#### App-specific Permissions
The following permission descriptions have been added to `Info.plist`:

- Camera: "StrangerWave needs camera access to enable video chat with other users."
- Microphone: "StrangerWave needs microphone access to enable voice communication during chats."
- Photo Library: "StrangerWave needs photo library access to allow sharing images in conversations."
- Notifications: "StrangerWave uses notifications to alert you about new messages and matches."

#### App Transport Security
ATS is configured with exceptions only for essential third-party services.

### Android Specific Requirements

#### Permissions in AndroidManifest.xml
The following permissions are declared with appropriate rationales:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" android:required="false" />
<uses-permission android:name="android.permission.RECORD_AUDIO" android:required="false" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.VIBRATE" />
```

#### Runtime Permissions
Runtime permission handling is implemented with clear request dialogs explaining why each permission is needed.

### Cross-Platform Requirements

#### In-App Purchases Configuration
- In-app products for both platforms have been created:
  - Premium Subscription ($2.99/month)
  - VIP Subscription ($7.99/month)
  - Ultimate Subscription ($14.99/month)
  - Token Packages (various prices)
  - Unban Fee ($10.99)

#### Deep Linking
Deep linking is configured for both platforms to support:
- User referrals
- Direct chat access
- Notification responses

## Submission Checklist

### Apple App Store

- [ ] App Store Connect account is set up
- [ ] All app icons are prepared to specifications
- [x] Screenshots are prepared for all required device sizes
- [x] App Privacy details are prepared
- [x] App Review Information is ready
- [x] Marketing URL is set up
- [x] Support URL is functional
- [x] TestFlight beta testing has been completed
- [x] In-App Purchases have been created and tested

### Google Play Store

- [ ] Google Play Console account is set up
- [x] App signing key has been created and stored securely
- [x] All app icons are prepared to specifications
- [x] Screenshots and feature graphic are prepared
- [x] Content rating questionnaire answers are prepared
- [x] Privacy policy URL is functional
- [x] Internal testing track has been utilized
- [x] In-App Products have been created and tested
- [x] App content has been evaluated against Play policies

## Build and Distribution Process

### iOS Build Process

1. Open the iOS project in Xcode:
   ```bash
   npx cap open ios
   ```

2. Configure app signing:
   - Select the appropriate team
   - Configure signing certificate
   - Verify bundle identifier

3. Create archive for distribution:
   - Select "Generic iOS Device" as build target
   - Product > Archive
   - Upload to App Store Connect through Xcode

### Android Build Process

1. Update capacitor.config.ts with final app settings
2. Generate Android project:
   ```bash
   npx cap sync android
   ```

3. Open Android project:
   ```bash
   npx cap open android
   ```

4. Build signed APK/AAB:
   - Build > Generate Signed Bundle/APK
   - Select Android App Bundle (AAB) for Play Store
   - Use keystore file from secure storage
   - Build using 'release' variant

5. Upload to Google Play Console

## Post-Submission

### Monitoring

Monitor the review process through:
- App Store Connect for iOS
- Google Play Console for Android

### Common Rejection Reasons

Be prepared to address these common issues:
- Age verification implementation
- Content moderation effectiveness
- Privacy policy completeness
- Subscription terms clarity
- Performance on older devices

### App Updates

The update process follows the same steps as initial submission:
1. Increment version numbers in capacitor.config.ts
2. Rebuild with new version
3. Submit through respective platforms

---

This guide should be updated regularly as platform requirements change.