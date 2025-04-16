# StrangerWave App Store Submission Guide

This guide outlines the complete process for submitting the StrangerWave app to both the Apple App Store and Google Play Store, including preparation, submission steps, and release management.

## App Store Submission Timeline

| Stage | Estimated Time | Notes |
|-------|----------------|-------|
| App preparation | 1-2 weeks | Finalize code, testing, and assets |
| Initial submission | 1 day | Upload binary and metadata |
| App review (Apple) | 1-3 days | Can be longer if issues are found |
| App review (Google) | 1-3 days | Usually faster than Apple |
| TestFlight review | 1 day | For beta testing on iOS |
| Addressing feedback | Variable | Depends on issues found |
| Public release | 1 day | After approval |
| Post-release monitoring | Ongoing | Analytics and user feedback |

## Apple App Store Submission Process

### Prerequisites

1. **Apple Developer Account**
   - Annual fee: $99
   - Company accounts require a D-U-N-S number
   - Individual accounts require identity verification

2. **App Store Connect Setup**
   - Create a new app entry
   - Set up bundle ID (must match your Xcode project)
   - Configure App Store information
   - Set up in-app purchases

3. **Required Materials**
   - App binary (built with release configuration)
   - App screenshots (see screenshot checklist)
   - App preview videos (optional)
   - Metadata (descriptions, keywords, etc.)
   - Privacy policy URL
   - Support URL
   - Marketing URL (optional)
   - App icon (1024x1024 PNG)

### Submission Steps

1. **Build and Archive in Xcode**
   ```
   Open iOS project in Xcode
   Select "Generic iOS Device" as the build destination
   Choose Product > Archive
   ```

2. **Validate the Archive**
   ```
   In the Organizer window, select your archive
   Click "Validate App"
   Address any validation issues
   ```

3. **Upload to App Store Connect**
   ```
   In the Organizer window, select your archive
   Click "Distribute App"
   Select "App Store Connect"
   Follow the prompts to complete the upload
   ```

4. **Complete App Store Information**
   - Log in to App Store Connect
   - Navigate to your app
   - Complete all required metadata fields
   - Upload screenshots and preview videos
   - Set up pricing and availability
   - Configure in-app purchases
   - Complete app privacy information

5. **Submit for Review**
   - Ensure all required information is complete
   - Click "Submit for Review"
   - Answer the export compliance questions
   - Provide demo account credentials if needed
   - Choose release option (manual or automatic)

### TestFlight Distribution

1. **Enable TestFlight**
   - In App Store Connect, go to the TestFlight tab
   - Upload a build if not already done
   - Complete TestFlight information

2. **Add Internal Testers**
   - Add Apple IDs of team members
   - They will receive an email invitation

3. **Add External Testers**
   - Create test groups
   - Add email addresses
   - Requires a beta app review by Apple

4. **Gather TestFlight Feedback**
   - Monitor testing notes in App Store Connect
   - Address issues before public release

## Google Play Store Submission Process

### Prerequisites

1. **Google Play Developer Account**
   - One-time fee: $25
   - Requires valid ID and payment information

2. **Google Play Console Setup**
   - Create a new app
   - Set up app details and categorization
   - Configure store listing information

3. **Required Materials**
   - Signed APK or App Bundle
   - Store listing screenshots
   - Feature graphic (1024x500)
   - App icon (512x512)
   - Promo graphic (optional)
   - Promo video (optional)
   - Privacy policy URL
   - Metadata (descriptions, etc.)

### Submission Steps

1. **Generate Signed APK/Bundle**
   ```
   Open Android project in Android Studio
   Choose Build > Generate Signed Bundle/APK
   Select Android App Bundle or APK
   Create or use existing keystore
   Build the release version
   ```

2. **Create Store Listing**
   - Log in to Google Play Console
   - Navigate to your app
   - Complete store listing information
   - Upload screenshots, graphics, and videos
   - Set up pricing and distribution
   - Configure in-app products

3. **Complete Content Rating Questionnaire**
   - Answer questions about app content
   - Obtain appropriate rating

4. **Complete Data Safety Form**
   - Disclose data collection practices
   - Match with privacy policy

5. **Set Up App Release**
   - Choose release track (internal testing, closed testing, open testing, or production)
   - Upload signed APK/Bundle
   - Add release notes
   - Review and start rollout

### Testing Tracks

1. **Internal Testing**
   - Limited to Google Play Console users
   - Quick testing with no review
   - Up to 100 testers

2. **Closed Testing**
   - Email invitations or Google Groups
   - Requires a shorter review
   - More extensive testing

3. **Open Testing**
   - Available to anyone via Play Store
   - Requires full review
   - Can set user limit

## Release Management

### Phased Release Strategy

1. **Internal Testing**
   - Development team only
   - Basic functionality testing

2. **Closed Beta**
   - TestFlight/Internal Testing
   - Limited external testers
   - Core functionality testing

3. **Open Beta**
   - Wider testing audience
   - Stability and performance testing
   - Feature refinement

4. **Limited Production Release**
   - Percentage-based rollout (10%, 25%, 50%, 100%)
   - Monitor crash reports and feedback
   - Be prepared to pause rollout if issues arise

5. **Full Production Release**
   - Complete rollout to all users
   - Ongoing monitoring

### Version Management

- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Increment build number for each submission
- Keep detailed release notes
- Maintain a changelog for internal reference

### Handling App Rejections

#### Apple Common Rejection Reasons
- Metadata issues
- Privacy concerns
- Payment system violations
- Broken functionality
- Poor performance
- Misleading descriptions

#### Google Common Rejection Reasons
- Policy violations
- App crashes
- Intellectual property issues
- Deceptive behavior
- Inappropriate content
- Security vulnerabilities

#### Addressing Rejections
1. Read rejection reasons carefully
2. Address all issues comprehensively
3. Provide clear explanations in resolution notes
4. Resubmit promptly
5. Consider appealing if you believe the rejection is incorrect

## Post-Release Activities

### Monitoring and Analytics
- Track installation and usage metrics
- Monitor crash reports
- Analyze user behavior
- Identify performance issues

### User Feedback Management
- Respond to reviews promptly
- Address common issues in updates
- Thank users for positive feedback
- Use feedback to prioritize improvements

### Regular Updates
- Plan a regular update cadence (e.g., monthly)
- Group fixes and minor features
- Major features warrant dedicated releases
- Consider seasonal or event-based updates

## Checklist for Each App Update

- [ ] All new features thoroughly tested
- [ ] Regression testing completed
- [ ] Analytics tracking verified
- [ ] Release notes prepared
- [ ] Screenshots updated (if UI changes)
- [ ] Version and build numbers incremented
- [ ] Final QA pass on release build
- [ ] Backup of previous version archive/bundle
- [ ] Team briefed on release timeline
- [ ] Customer support prepared for new features
- [ ] Marketing materials updated

## Important Contacts

### Apple Developer Support
- Developer Forums: https://developer.apple.com/forums/
- Contact Form: https://developer.apple.com/contact/

### Google Play Support
- Developer Help: https://support.google.com/googleplay/android-developer/
- Contact Form: https://support.google.com/googleplay/android-developer/contact/