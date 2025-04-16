# StrangerWave App Submission Documentation Index

This document serves as a complete index to all the resources and documentation created to help you through the app submission process for StrangerWave on both the Google Play Store and Apple App Store.

## Core Submission Guides

1. [**Complete App Store Submission Guide**](./app-store-submission-guide.md)
   - Comprehensive checklist for submitting to both app stores
   - Step-by-step instructions for each platform
   - Required information for store listings
   - Content rating guidelines

2. [**Apple Certificate Setup Guide**](./apple-certificate-setup.md)
   - Creating Certificate Signing Requests (CSR)
   - Generating distribution certificates
   - Creating provisioning profiles
   - Xcode configuration

## Compliance Documentation

3. [**Age Verification Compliance**](./age-verification-compliance.md)
   - Implementation of age gates
   - Server-side verification systems
   - Content moderation requirements
   - Legal requirements and terms of service

4. [**In-App Purchase Setup**](./in-app-purchase-setup.md)
   - Configuration of subscription tiers
   - One-time purchase setup
   - Testing procedures
   - Server-side verification
   - Legal requirements

5. [**Post-Launch Management**](./post-launch-management.md)
   - First 30 days monitoring plan
   - Ongoing maintenance checklist
   - Quarterly management activities
   - Crisis management preparation
   - KPIs to track

## App Store Assets

6. **Store Listings**
   - [Android Store Listing](../store-assets/android/store-listing.md)
   - [iOS App Store Listing](../store-assets/ios/app-store-listing.md)

7. **Screenshots & Graphics**
   - Android screenshots: `../store-assets/android/screenshots/`
   - iOS screenshots: `../store-assets/ios/screenshots/`
   - Feature graphics: `../store-assets/android/feature-graphic.png`
   - App icons: `../store-assets/app-icon/`

## Credentials & Keys

8. **Android Keystore**
   - Location: `../keystores/strangerwave.keystore`
   - Password: `strangerwave123`
   - Key alias: `strangerwave`
   - Key password: `strangerwave123`

9. **iOS Certificates**
   - Instructions for creating Apple certificates in [Apple Certificate Setup Guide](./apple-certificate-setup.md)

## Build Instructions

10. **Android Build**
    ```bash
    # Build for production
    npm run build
    
    # Copy web assets to Android
    npx cap copy android
    npx cap sync android
    
    # Generate App Bundle
    cd android
    ./gradlew bundleRelease
    
    # Output location:
    # android/app/build/outputs/bundle/release/app-release.aab
    ```

11. **iOS Build**
    ```bash
    # Build for production
    npm run build
    
    # Copy web assets to iOS
    npx cap copy ios
    npx cap sync ios
    
    # Open in Xcode for final build steps
    npx cap open ios
    ```

## Submission Checklists

12. **Pre-Submission Final Checklist**
    - [ ] App icon and splash screen properly configured
    - [ ] All app store assets prepared and sized correctly
    - [ ] Age verification implemented and tested
    - [ ] In-app purchases configured and tested
    - [ ] Privacy policy and terms of service accessible
    - [ ] App tested on multiple device sizes
    - [ ] All legal requirements addressed

13. **Submission Ready Files**
    - [ ] Android: Signed AAB or APK
    - [ ] Android: Privacy policy URL
    - [ ] iOS: Archive uploaded to App Store Connect
    - [ ] iOS: Screenshots for all required device sizes
    - [ ] Both: App metadata completed

## Additional Resources

14. **Helpful Links**
    - [Google Play Console](https://play.google.com/console)
    - [App Store Connect](https://appstoreconnect.apple.com)
    - [Apple Developer Portal](https://developer.apple.com)
    - [Google Play Developer Policy Center](https://play.google.com/about/developer-content-policy/)
    - [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

15. **Support Contacts**
    - Google Play Developer Support: From Play Console > Help & feedback
    - App Store Developer Support: [Apple Developer Support](https://developer.apple.com/support/)

## Next Steps

To begin the submission process:

1. Review the [App Store Submission Guide](./app-store-submission-guide.md)
2. Follow the platform-specific instructions
3. Use this index to locate any specific documentation you need during the process

For ongoing management after launch, refer to the [Post-Launch Management](./post-launch-management.md) guide.