# App Store Compliance Checklist for StrangerWave

This document outlines the key compliance requirements for both the Apple App Store and Google Play Store to ensure a successful submission and approval process.

## Common Requirements (Both Platforms)

### Age Rating and Restrictions
- [x] App properly rated for 17+/Mature audiences
- [x] Age verification implemented within the app
- [x] No content appealing primarily to children
- [x] Clear indication that the app is for adults 18+ in descriptions and in-app messaging

### Privacy Requirements
- [x] Privacy Policy created and accessible from the app
- [x] All data collection disclosed in privacy policy
- [x] Required permissions are properly justified
- [x] Users can request data deletion
- [x] No unnecessary permission requests

### Content Moderation
- [x] AI moderation system implemented
- [x] User reporting system functional
- [x] Blocking features available
- [x] "Skip" functionality to avoid unwanted interactions
- [x] System to ban users who violate terms
- [x] Clear community guidelines accessible in-app

### Payments and Subscriptions
- [x] All in-app purchases use platform billing systems
- [x] Clear description of what each purchase provides
- [x] Subscription terms clearly explained
- [x] Cancellation instructions provided
- [x] Restoration of purchases functionality

## Apple App Store Specific Requirements

### Technical Requirements
- [ ] App functions properly on all supported iOS versions (iOS 14+)
- [ ] No crashes or technical issues during usage
- [ ] App works in airplane mode or with limited connectivity (graceful degradation)
- [ ] All links within the app function properly
- [ ] No references to external payment systems
- [ ] No references to Android, Google Play, or alternative platforms

### App Review Guidelines
- [ ] No usage of private APIs
- [ ] Appropriate use of Apple frameworks
- [ ] No misleading functions or marketing
- [ ] Complete metadata submitted
- [ ] App does not duplicate core iOS functionality
- [ ] Appropriate sign-in requirements (if applicable)

### Design Requirements
- [ ] Adheres to Human Interface Guidelines
- [ ] Proper support for dark mode
- [ ] Supports all required device orientations
- [ ] No use of Apple product imagery in screenshots
- [ ] App icon follows guidelines (no transparency)
- [ ] Proper handling of notch/safe areas on newer devices

## Google Play Store Specific Requirements

### Technical Requirements
- [ ] App functions properly on various Android versions (Android 8.0+)
- [ ] Appropriate target API level (currently API level 33+)
- [ ] Proper support for different screen sizes
- [ ] App works with limited connectivity (graceful degradation)
- [ ] All links function properly

### Play Store Policies
- [ ] Complies with Developer Program Policies
- [ ] Appropriate content filtering and moderation
- [ ] No deceptive behavior or content
- [ ] No unauthorized intellectual property
- [ ] No incentivized ratings, reviews, or installs

### Design Requirements
- [ ] Follows Material Design guidelines
- [ ] Supports dark mode
- [ ] Adaptive icons implemented
- [ ] Proper support for different screen densities
- [ ] Appropriate handling of different aspect ratios

## Submission Preparation Checklist

### Apple App Store
- [ ] Apple Developer Account active ($99/year)
- [ ] App Store Connect account set up
- [ ] App record created in App Store Connect
- [ ] All required screenshots uploaded
- [ ] App preview video(s) uploaded (optional)
- [ ] App binary uploaded through Xcode or Transporter
- [ ] All metadata fields completed
- [ ] In-app purchases configured in App Store Connect
- [ ] Test account credentials provided for review
- [ ] Content rights documentation (if applicable)

### Google Play Store
- [ ] Google Developer Account active ($25 one-time fee)
- [ ] Play Console account set up
- [ ] App listing created in Play Console
- [ ] All required screenshots uploaded
- [ ] Feature graphic uploaded
- [ ] Promo video linked (optional)
- [ ] APK or App Bundle uploaded
- [ ] All metadata fields completed
- [ ] In-app products configured in Play Console
- [ ] Content rating questionnaire completed
- [ ] Data safety form completed
- [ ] Test account credentials provided for review

## Pre-Submission Final Checks

- [ ] Thoroughly test the build that will be submitted
- [ ] Verify all links, buttons, and features work
- [ ] Check for any placeholder content or images
- [ ] Verify proper handling of edge cases (no internet, low battery, interruptions)
- [ ] Review all text for typos or grammatical errors
- [ ] Ensure analytics implementation is working correctly
- [ ] Test all purchase flows with sandbox/test accounts
- [ ] Verify app size is optimized (under 150MB preferred)
- [ ] Create a pre-launch report in Google Play Console
- [ ] Address any issues found in pre-launch report