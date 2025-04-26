# Apple Certificate Creation Guide for StrangerWave

This guide provides step-by-step instructions for creating the necessary certificates to submit your iOS app to the App Store.

## Prerequisites

- An active Apple Developer Program account ($99/year)
- Access to the Apple Developer website (developer.apple.com)
- A Mac computer (required for creating certificates and uploading to App Store)
- Xcode installed (latest version recommended)

## Step 1: Create App ID

1. Log in to [Apple Developer Portal](https://developer.apple.com/account/)
2. Go to "Certificates, IDs & Profiles"
3. Under "Identifiers", click the "+" button
4. Select "App IDs" and click "Continue"
5. Select "App" as the type and click "Continue"
6. Enter a description (e.g., "StrangerWave App")
7. Enter your Bundle ID: `com.strangerwave.app`
8. Under Capabilities, enable:
   - Push Notifications
   - In-App Purchase
9. Click "Continue" and then "Register"

## Step 2: Create a Certificate Signing Request (CSR)

1. On your Mac, open "Keychain Access" (Applications > Utilities)
2. Go to Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority
3. Enter your email address and common name (your name)
4. Select "Saved to disk" and click "Continue"
5. Save the CSR file to your desktop

## Step 3: Create Distribution Certificate

1. Return to [Apple Developer Portal](https://developer.apple.com/account/)
2. Go to "Certificates, IDs & Profiles"
3. Under "Certificates", click the "+" button
4. Select "App Store and Ad Hoc" under Production and click "Continue"
5. Upload the CSR file you created in Step 2 and click "Continue"
6. Click "Download" to download your certificate
7. Double-click the downloaded certificate to install it in Keychain Access

## Step 4: Create Provisioning Profile

1. Return to [Apple Developer Portal](https://developer.apple.com/account/)
2. Go to "Certificates, IDs & Profiles"
3. Under "Profiles", click the "+" button
4. Select "App Store" under Distribution and click "Continue"
5. Select the App ID you created in Step 1 and click "Continue"
6. Select the Distribution Certificate you created in Step 3 and click "Continue"
7. Enter a name for your profile (e.g., "StrangerWave Distribution Profile") and click "Generate"
8. Click "Download" to download your provisioning profile
9. Double-click the downloaded provisioning profile to install it

## Step 5: Configure Xcode

1. Open Xcode
2. Go to Xcode > Preferences > Accounts
3. Add your Apple ID if not already added
4. Select your Apple ID and click "Manage Certificates"
5. Click the "+" button at the bottom and select "Apple Distribution"
6. Close the preferences window

## Step 6: Configure Your App for Distribution

1. Open your iOS project in Xcode using:
   ```bash
   npx cap open ios
   ```
2. Select the project in the navigator
3. Select the app target
4. Go to the "Signing & Capabilities" tab
5. Ensure "Automatically manage signing" is checked
6. Select your Team from the dropdown
7. Xcode should automatically select the appropriate provisioning profile

## Step 7: Archive and Upload

1. In Xcode, select "Generic iOS Device" from the device menu
2. Select Product > Archive
3. Once archiving is complete, the Organizer window will appear
4. Click "Validate App" to check for issues
5. If validation succeeds, click "Distribute App"
6. Select "App Store Connect" and click "Next"
7. Select "Upload" and click "Next"
8. Select your distribution certificate and click "Next"
9. Click "Upload"

## Step 8: Complete App Store Submission

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to "My Apps" and select your app (or create a new app if needed)
3. Complete all required information (refer to the main submission guide)
4. Once your build appears in the "Builds" section (may take up to 30 minutes after upload), select it
5. Complete the "Submit for Review" process

## Important Notes

1. **Certificate Expiration**: 
   - Distribution certificates expire after one year
   - You'll need to create a new certificate before expiration
   - Calendar reminders are recommended

2. **Private Key Backup**:
   - Export your private key from Keychain Access for backup
   - Without this key, you cannot create new provisioning profiles with your certificate

3. **Common Issues**:
   - "No matching provisioning profiles found": Make sure your bundle ID in Xcode matches the one in your App ID
   - "Invalid entitlements": Check that capabilities in Xcode match those in your App ID
   - "No signing certificate found": Ensure your certificate is properly installed in Keychain Access

4. **TestFlight**:
   - Consider submitting to TestFlight first for beta testing
   - This allows you to test the app with external users before full App Store submission
   - TestFlight builds are also reviewed by Apple, but the review process is typically faster

5. **Review Preparation**:
   - Ensure all app functionality works without needing special server configurations
   - Provide test credentials in the App Review Information section
   - Be prepared to provide evidence of legal rights to use any trademarked content

If you encounter any issues during this process, Apple's Developer Support is available to help at [Apple Developer Support](https://developer.apple.com/support/).