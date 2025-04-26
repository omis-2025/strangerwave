# StrangerWave App Submission Checklist

Use this checklist to track your progress through the submission process for both app stores.

## Final Build Preparation

### Android Build
- [ ] Update version code and version name in `android/app/build.gradle`
- [ ] Configure ProGuard for release build
- [ ] Verify app signing configuration
- [ ] Run final lint check to resolve any warnings
- [ ] Generate signed release APK/AAB
- [ ] Test APK/AAB on multiple devices
- [ ] Verify all features work on the release build

### iOS Build
- [ ] Update version and build number in Xcode project
- [ ] Set proper deployment target (iOS 14+)
- [ ] Configure app capabilities in Xcode
- [ ] Run Xcode Analyzer to resolve any warnings
- [ ] Create archive in Xcode
- [ ] Validate archive in App Store Connect
- [ ] Test TestFlight build on multiple devices

## Google Play Store Submission

### Account Setup
- [ ] Google Play Developer account active
- [ ] Payment method for developer account updated
- [ ] Team members added with appropriate access levels

### Store Listing
- [ ] App name finalized: "StrangerWave - Anonymous Chat & Video"
- [ ] Short description completed (80 characters max)
- [ ] Full description completed (4000 characters max)
- [ ] App categorized as "Social"
- [ ] Content rating questionnaire completed (expected rating: Mature 17+)
- [ ] Contact details updated (email, website, privacy policy)

### Graphics Assets
- [ ] App icon uploaded (512x512 PNG)
- [ ] Feature graphic uploaded (1024x500 PNG)
- [ ] Phone screenshots uploaded (min 2, max 8)
- [ ] Tablet screenshots uploaded (optional)
- [ ] Promotional video linked (optional)

### Release Setup
- [ ] APK/AAB uploaded
- [ ] Release notes completed
- [ ] Countries/regions for distribution selected
- [ ] Pricing & distribution options set
- [ ] Launch approval for managed publishing enabled

### In-App Products
- [ ] All subscription products configured
- [ ] Subscription grace period set
- [ ] Prices set for all regions
- [ ] Subscription benefits clearly described

### Data Safety Form
- [ ] Data safety form completed
- [ ] All data collection practices disclosed
- [ ] Security practices described
- [ ] Third-party libraries/SDKs disclosed

### Final Checks
- [ ] App tested on release track (internal testing)
- [ ] Pre-launch report reviewed
- [ ] All policy compliance issues addressed
- [ ] Form filled out as per `store-assets/android/data-safety-form.md`

## Apple App Store Submission

### Account Setup
- [ ] Apple Developer account active
- [ ] Team members added with appropriate roles
- [ ] Certificates and provisioning profiles set up

### App Store Connect
- [ ] App record created in App Store Connect
- [ ] App Information completed
   - [ ] Privacy Policy URL
   - [ ] Support URL
   - [ ] Marketing URL (optional)
   - [ ] App category set to "Social Networking"
   - [ ] Content rights declaration
- [ ] App Store Information
   - [ ] Promotional text (170 characters)
   - [ ] Description
   - [ ] Keywords (100 characters max)
   - [ ] Support contact information

### Graphics Assets
- [ ] App icon uploaded (1024x1024 PNG)
- [ ] iPhone screenshots uploaded (required sizes)
   - [ ] 6.5" display screenshots (min 3)
   - [ ] 5.5" display screenshots (min 3)
- [ ] iPad screenshots uploaded (if supporting iPad)
- [ ] App preview videos uploaded (optional)

### Release Setup
- [ ] Build uploaded via Xcode or Transporter
- [ ] "What's New in This Version" text completed
- [ ] Release date set (or manual release selected)
- [ ] Phased release enabled (recommended)
- [ ] Version Release set up as per `store-assets/ios/app-review-information.md`

### In-App Purchases
- [ ] All subscription products configured
- [ ] Subscription groups created
- [ ] Prices set for all territories
- [ ] Review information for IAPs completed
- [ ] Subscription promotional offers set up (if applicable)

### App Review Information
- [ ] Contact information provided
- [ ] Demo account credentials provided
- [ ] Notes for reviewers added
- [ ] Special configurations explained

### App Privacy
- [ ] App Privacy information completed
- [ ] Data collection practices disclosed
- [ ] Tracking authorization implementation explained
- [ ] App privacy details filled as per Data Types in `store-assets/android/data-safety-form.md`

### Age Rating
- [ ] Age rating questionnaire completed (expected: 17+)
- [ ] Content descriptions accurate
- [ ] Unrestricted web access indicated

### Final Checks
- [ ] App tested via TestFlight
- [ ] All privacy features verified
- [ ] In-app purchases tested in sandbox
- [ ] Submission checklist from Apple reviewed
- [ ] Test account functioning properly

## Regional Compliance

### GDPR Compliance (EU)
- [ ] User consent mechanisms implemented
- [ ] Privacy policy includes GDPR provisions
- [ ] Data subject rights implemented (access, deletion)
- [ ] Data processing records maintained
- [ ] EU representative appointed (if required)

### CCPA Compliance (California)
- [ ] "Do Not Sell My Personal Information" option
- [ ] Privacy policy includes CCPA provisions
- [ ] Data categories and sharing disclosed
- [ ] Opt-out rights implemented

### Additional Region Requirements
- [ ] COPPA compliance plan (US)
- [ ] PIPEDA compliance (Canada)
- [ ] LGPD compliance (Brazil)
- [ ] APPI compliance (Japan)

## Post-Submission

### Monitoring
- [ ] App Store Connect notifications enabled
- [ ] Google Play Console notifications enabled
- [ ] Team members assigned to monitor review process
- [ ] Contact information updated for review team questions

### Launch Preparation
- [ ] Marketing materials prepared
- [ ] Support system ready
- [ ] Analytics monitoring set up
- [ ] Bug reporting system prepared

## Notes

Use this section to note any issues or special considerations during the submission process:
