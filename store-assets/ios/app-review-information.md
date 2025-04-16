# App Review Information for Apple App Store

## App Review Information

### Notes for App Review

StrangerWave is an anonymous chat and video calling application that allows users to connect with strangers worldwide. The app is designed for users 18 years and older, with proper age verification implemented.

Key features of the app include:
- Text-based chat with strangers
- Video calling functionality
- Matching based on preferences (gender, country)
- Reporting and blocking systems for safety
- Premium subscription options

**Important Notes for Reviewers:**

1. **Age Verification:** The app implements age verification at startup and is intended for adults 18+.

2. **Content Moderation:** We use AI-powered moderation to prevent inappropriate content. The system flags potentially harmful messages and images in real-time.

3. **User Safety:** Users can report inappropriate behavior, and our system includes automatic banning for violations.

4. **Privacy Considerations:** The app does not store chat histories beyond the active session, and users remain anonymous.

5. **Subscription IAPs:** The app offers premium subscription options with proper disclosure of terms and conditions.

### Test Account Information

**Demo Account Credentials:**
- Username: `appreviewer`
- Password: `ReviewTest2024!`

This account has been granted premium features for testing purposes.

### Test Instructions

1. **Basic Functionality Testing:**
   - Launch the app and proceed through age verification
   - Select gender and preferences on the setup screens
   - Tap "Start Chat" to be matched with another user
   - Test text chat functionality

2. **Video Chat Testing:**
   - After matching with another user, tap the video call button
   - Both the local camera preview and remote video should appear
   - Test mute and camera toggle buttons
   - End the call using the end call button

3. **Safety Features Testing:**
   - During a chat, access the report function via the menu
   - Test the block function
   - Skip to a new match using the "Skip" button

4. **Premium Features Testing:**
   - Navigate to the premium features screen
   - Review the subscription options
   - Test the restore purchases functionality (the demo account already has premium access)

5. **Settings and Preferences:**
   - Access the settings menu
   - Change gender and country preferences
   - Toggle notification settings

### Known Issues

We are aware of and working on the following minor issues:
- Occasional delay in video call connection on slow networks
- UI rendering issues on certain older iOS devices

### Special Review Notes

1. **In-App Purchases:**
   All IAPs use Apple's standard StoreKit implementation with no external payment methods referenced.

2. **Video Permissions:**
   The app requests camera and microphone permissions only when needed for video calls.

3. **Push Notifications:**
   Push notifications are used only for chat messages and are not marketing-oriented.

4. **Data Collection:**
   All data collection is disclosed in our privacy policy and App Store privacy details.

5. **Adult Content Handling:**
   While the app is for adults 18+, we have strict moderation to prevent inappropriate content.