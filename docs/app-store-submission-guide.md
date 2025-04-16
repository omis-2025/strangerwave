# StrangerWave App Store Submission Guide

This document provides complete guidance for submitting StrangerWave to both the Apple App Store and Google Play Store.

## Important Credentials and Resources

### Android
- **Keystore location**: `keystores/strangerwave.keystore`
- **Keystore password**: `strangerwave123`
- **Key alias**: `strangerwave`
- **Key password**: `strangerwave123`
- **Package name**: `com.strangerwave.app`
- **Min SDK**: 22 (Android 5.1)
- **Target SDK**: 34 (Android 14)

### iOS
- **Bundle ID**: `com.strangerwave.app`
- **Deployment Target**: iOS 14.0
- **Device Family**: iPhone and iPad

## Google Play Store Submission Checklist

### Account Setup
- [ ] Google Play Developer account created (one-time $25 fee)
- [ ] Two-factor authentication enabled for security
- [ ] Payment profile configured for receiving revenue

### App Preparation
1. **Generate signed AAB/APK**:
   ```bash
   # Build for production
   npm run build
   
   # Copy web assets to Android
   npx cap copy android
   npx cap sync android
   
   # Generate App Bundle (preferred for Google Play)
   cd android
   ./gradlew bundleRelease
   
   # The AAB will be at:
   # android/app/build/outputs/bundle/release/app-release.aab
   ```

2. **Create Store Listing**:
   - App name: "StrangerWave - Anonymous Chat & Video"
   - Short description (80 chars max):
     ```
     Connect with random people globally via video or text chat with privacy controls.
     ```
   - Full description (4000 chars max):
     ```
     StrangerWave is a cutting-edge anonymous chat platform that enables global, secure social interactions through intelligent communication technologies.
     
     Connect with people from around the world through instant one-on-one text or video chats. Our platform matches you with random strangers based on your preferences, allowing you to have meaningful conversations while maintaining your privacy.
     
     Features:
     • Anonymous video and text chatting
     • Smart matching based on your preferences
     • Gender and location-based filters
     • Skip or stop conversations at any time
     • Advanced content moderation for safety
     • Premium subscription options for enhanced features
     
     StrangerWave uses advanced AI for content moderation, ensuring a safe environment for all users. Our platform is designed for adults 18+, with strict compliance to global privacy and content standards.
     
     Premium subscription options unlock enhanced features such as priority matching, ad-free experience, and special filters.
     
     Download StrangerWave today and start exploring new connections!
     
     Note: This app is intended for users 18 years or older. Internet connection required for functionality.
     ```
   - Upload screenshots (8 required):
     - Minimum 2 screenshots
     - Resolution: 16:9 aspect ratio recommended
     - Formats: JPG or PNG (no alpha)
     - See `store-assets/android/screenshots` folder

3. **Content Rating Questionnaire**:
   - Category: Social Networking
   - Contains user-generated content: Yes
   - Signs: Violence - None, Sexuality - None, Language - Mild, Controlled Substances - None
   - Adult content - Contains user interactions that may include mature themes
   - Expected Rating: Mature 17+

4. **App Category**:
   - Primary: Social
   - Tags: Chatting, Video Chat, Messaging

5. **Contact Information**:
   - Email address: [Your support email]
   - Website: [Your website]
   - Phone (optional): [Your phone number]

6. **Privacy Policy**:
   - URL to privacy policy: [Your privacy policy URL]
   - Must include GDPR, CCPA compliance information
   - Must specify data collection practices

7. **Pricing & Distribution**:
   - App price: Free
   - Countries: All countries
   - Contains ads: Yes
   - Contains in-app purchases: Yes

8. **In-App Products**:
   - Premium subscription ($5.99/month)
   - VIP subscription ($9.99/month)
   - Ultimate subscription ($12.99/month)
   - Unban fee ($10.99 one-time)

9. **Release Management**:
   - Production track
   - Staged rollout (start with 20%)
   - Release notes:
     ```
     Initial release of StrangerWave - Anonymous Chat & Video
     • Random matching with strangers
     • Video and text chat options
     • Preference-based filtering
     • Premium subscription features
     ```

10. **Data Safety Section**:
    - Data collected and shared: 
      - Location (approximate, not precise)
      - User IDs
      - Messages (not shared with third parties)
      - Photos and videos (with consent)
    - Data security practices:
      - Data is encrypted in transit
      - Users can request data deletion
      - In compliance with GDPR and CCPA

## Apple App Store Submission Checklist

### Account Setup
- [ ] Apple Developer Program account ($99/year)
- [ ] App Store Connect access configured
- [ ] Certificates, IDs & Profiles configured

### App Preparation
1. **Generate and upload app**:
   ```bash
   # Build for production
   npm run build
   
   # Copy web assets to iOS
   npx cap copy ios
   npx cap sync ios
   
   # Open in Xcode
   npx cap open ios
   ```
   
   In Xcode:
   - Update version and build number under General tab
   - Select Generic iOS Device as build target
   - Choose Product > Archive
   - Validate and upload to App Store Connect

2. **App Store Information**:
   - App name: "StrangerWave - Anonymous Chat & Video"
   - Subtitle: "Connect with new people globally"
   - Primary Language: English (U.S.)
   - Bundle ID: com.strangerwave.app
   - SKU: STRANGERWAVE2023
   - Primary Category: Social Networking
   - Secondary Category: Lifestyle

3. **App Store Screenshots**:
   - 6.5" iPhone display (1284 × 2778 px)
   - 5.5" iPhone display (1242 × 2208 px)
   - iPad Pro display (2048 × 2732 px) if supporting iPad
   - See `store-assets/ios/screenshots` folder

4. **App Preview**:
   - 30 seconds max
   - Shows key features
   - No developer name/info
   - See `store-assets/ios/app-preview` folder
   
5. **Description**:
   - Same as Google Play Store (see above)

6. **Keywords**:
   - anonymous, chat, video chat, random, strangers, social, messaging, friends, live

7. **Support URL**:
   - [Your support URL]

8. **Marketing URL** (optional):
   - [Your marketing website]

9. **Privacy Policy URL**:
   - [Your privacy policy URL]

10. **App Review Information**:
    - Contact info:
      - First name: [Your first name]
      - Last name: [Your last name]
      - Phone: [Your phone number]
      - Email: [Your email]
    - Demo account (if login required):
      - Username: [Demo username]
      - Password: [Demo password]
    - Notes for Review:
      ```
      StrangerWave is an anonymous chat platform for users 18+. It matches users randomly for text and video chat. All content is moderated through AI to prevent inappropriate material. The app includes age verification on first launch.
      
      Premium subscriptions are available but full functionality can be tested with the provided demo account.
      ```

11. **Version Information**:
    - Version: 1.0.0
    - Release: Ready for review
    - Phased release: On (release over 7 days)
    - Automatic updates: Off
    - Release notes:
      ```
      Initial release of StrangerWave - Anonymous Chat & Video
      • Connect with random people globally
      • Video or text chat with privacy controls
      • Set preferences for matching
      • Premium features available
      ```

12. **Age Rating**:
    - 17+ due to:
      - Unrestricted web access
      - Infrequent/Mild Sexual Content and Nudity
      - User-Generated Content
      - Infrequent/Mild Mature/Suggestive Themes

13. **App Store Connect In-App Purchases**:
    - Create subscription group: "StrangerWave Premium"
    - Add three subscription tiers:
      1. Premium ($5.99/month)
      2. VIP ($9.99/month)
      3. Ultimate ($12.99/month)
    - Add consumable in-app purchase:
      - Unban fee ($10.99)
    - Set all territories and prices

## Final Checklist Before Submission

### Android
- [ ] App icon meets requirements (512x512 PNG)
- [ ] Feature graphic created (1024x500 PNG)
- [ ] Keystore backed up securely
- [ ] Privacy policy page live and accessible
- [ ] All required screenshots taken
- [ ] In-app purchases configured
- [ ] Content rating questionnaire completed
- [ ] Data safety section completed
- [ ] App tested on multiple Android devices

### iOS
- [ ] App icon meets requirements (1024x1024 PNG)
- [ ] All required screenshots taken
- [ ] App preview video created (optional)
- [ ] Privacy policy page live and accessible
- [ ] In-app purchases configured
- [ ] Age rating questionnaire completed
- [ ] App tested on multiple iOS devices
- [ ] All permissions properly implemented with usage descriptions

## Important Notes

1. **Keystore Security**:
   - The Android keystore MUST be kept secure
   - If lost, you cannot update your app on Google Play
   - Create backups in multiple secure locations

2. **App Review Time**:
   - Google Play: 1-3 days typically
   - App Store: 1-3 days typically, but can be longer
   - Plan for potential rejection and resubmission

3. **Post-Submission**:
   - Monitor review status daily
   - Address any feedback quickly
   - Prepare for staged rollout monitoring
   - Set up crash reporting

4. **Content Moderation**:
   - Ensure AI moderation is functioning correctly
   - Have manual moderation backup if possible
   - Review reported content system

5. **Compliance**:
   - GDPR (EU users)
   - CCPA (California users)
   - Age verification (COPPA compliance)
   - Local regulations for each market