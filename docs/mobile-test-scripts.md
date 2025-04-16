# StrangerWave Mobile App Test Scripts

This document provides detailed test scripts for thoroughly testing the StrangerWave mobile applications on both Android and iOS platforms.

## Test Environment Setup

Before beginning testing, ensure you have:

1. Test devices representing different screen sizes:
   - Android: Small (5"), Medium (6"), and Large (6.5"+) screens
   - iOS: iPhone SE/8, iPhone X/11, iPhone 12/13/14 Pro Max

2. Test accounts:
   - Regular user account
   - Premium account with subscription
   - Admin account (if applicable)

3. Network conditions:
   - Wifi connection
   - 4G/5G mobile data
   - Poor connectivity simulation
   - Offline mode

## Test Script 1: Installation and Onboarding

| # | Test Step | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 1.1 | Install app from store | App installs without errors | |
| 1.2 | Launch app for first time | Welcome screen appears with "Start Chatting" button | |
| 1.3 | Verify age verification prompt | Age verification screen appears with 18+ warning | |
| 1.4 | Test under-age response | App shows appropriate message and prevents access | |
| 1.5 | Accept age verification | App proceeds to gender selection screen | |
| 1.6 | Select gender and preferences | Preferences are saved correctly | |
| 1.7 | Verify permissions requests | Camera and microphone permissions requested appropriately | |
| 1.8 | Deny permissions | App explains why permissions are needed but continues with limited functionality | |
| 1.9 | Accept permissions | Full functionality is available | |
| 1.10 | Complete initial setup | Main chat screen appears | |

## Test Script 2: Core Functionality - Text Chat

| # | Test Step | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 2.1 | Tap "Start Chat" button | Matching animation appears | |
| 2.2 | Wait for match | Match is found and chat interface opens | |
| 2.3 | Send text message | Message appears in chat with correct formatting | |
| 2.4 | Receive text message | Incoming message appears with notification | |
| 2.5 | Send emoji | Emoji appears correctly in chat | |
| 2.6 | Send URL | URL is formatted as clickable link | |
| 2.7 | Click "Skip" button | Current chat ends and new matching begins | |
| 2.8 | Click "Stop" button | Chat ends and returns to main screen | |
| 2.9 | Test chat with app in background | Notifications appear for new messages | |
| 2.10 | Return to app from background | Chat state is preserved correctly | |

## Test Script 3: Video Chat Functionality

| # | Test Step | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 3.1 | Start new chat | Chat interface opens | |
| 3.2 | Tap video call button | Video call request is sent | |
| 3.3 | Accept video call (on test device) | Video call interface opens with camera activated | |
| 3.4 | Check self-view | Local camera feed is visible | |
| 3.5 | Check remote video | Remote video appears when connected | |
| 3.6 | Test mute button | Audio is muted/unmuted correctly | |
| 3.7 | Test camera toggle | Camera turns off/on correctly | |
| 3.8 | Test in poor network conditions | Video quality adapts to network conditions | |
| 3.9 | Switch between front/back cameras | Camera view switches correctly | |
| 3.10 | End video call | Call ends and returns to text chat | |
| 3.11 | Test incoming video call | Notification appears with accept/decline options | |
| 3.12 | Test video call with app in background | Call continues in background with notification | |

## Test Script 4: User Preferences and Filtering

| # | Test Step | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 4.1 | Open preferences screen | Preferences interface appears | |
| 4.2 | Change gender preference | Setting is saved correctly | |
| 4.3 | Change country filter | Setting is saved correctly | |
| 4.4 | Start chat with new preferences | Matching follows the set preferences | |
| 4.5 | Save preferences and close app | Preferences persist after app restart | |
| 4.6 | Test premium filter options (with premium account) | Additional filters are available and functional | |

## Test Script 5: Reporting and Safety Features

| # | Test Step | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 5.1 | Tap report button during chat | Report interface appears | |
| 5.2 | Select report reason | Reason options are displayed correctly | |
| 5.3 | Submit report | Confirmation message appears | |
| 5.4 | Block user | User is blocked and chat ends | |
| 5.5 | Verify blocked user | Blocked user doesn't match again in future sessions | |

## Test Script 6: Premium Features and Payments

| # | Test Step | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 6.1 | Open premium features screen | Premium options display with correct pricing | |
| 6.2 | Select monthly subscription | Platform payment interface appears | |
| 6.3 | Complete test purchase (sandbox) | Purchase completes and premium features unlock | |
| 6.4 | Verify premium status indicator | Premium badge/indicator appears in UI | |
| 6.5 | Test premium-only features | All premium features are functional | |
| 6.6 | Restore purchases | Previously purchased subscription is restored | |
| 6.7 | Cancel subscription (test) | Appropriate message appears | |
| 6.8 | Verify subscription ends at correct time | Premium access ends at expected time | |

## Test Script 7: App Performance and Stability

| # | Test Step | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 7.1 | Measure app cold start time | App starts within acceptable time (< 3 seconds) | |
| 7.2 | Run continuous chat sessions (10+ chats) | App remains stable with no crashes or memory issues | |
| 7.3 | Run video call for extended period (10+ minutes) | No degradation in call quality or app performance | |
| 7.4 | Rapidly switch between chat sessions | App handles transitions smoothly | |
| 7.5 | Test battery consumption during video call | Battery usage is within acceptable limits | |
| 7.6 | Force close during active chat | App recovers gracefully on restart | |
| 7.7 | Test with low device storage | App functions with appropriate warnings | |
| 7.8 | Test with many background apps running | Performance remains acceptable | |

## Test Script 8: Notifications and Background Behavior

| # | Test Step | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 8.1 | Receive message while app in background | Notification appears with correct content | |
| 8.2 | Tap notification | App opens directly to relevant chat | |
| 8.3 | Dismiss notification | Notification clears correctly | |
| 8.4 | Test do-not-disturb mode | Notifications respect system DND settings | |
| 8.5 | Test notification settings in app | Notification toggles work correctly | |
| 8.6 | Background app refresh | App updates state correctly when in background | |

## Test Script 9: Analytics and Tracking

| # | Test Step | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 9.1 | Complete various user journeys | Events are tracked in Firebase Analytics | |
| 9.2 | Verify key events (chat start, video call, etc.) | Events appear in analytics dashboard | |
| 9.3 | Check error logging | Errors are properly captured in analytics | |
| 9.4 | Verify user properties | User properties are correctly associated with events | |

## Test Script 10: App Store Specific Requirements

### iOS Tests
| # | Test Step | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 10.1 | Test in-app purchase using Apple Sandbox | Purchases complete correctly | |
| 10.2 | Test Sign in with Apple (if implemented) | Authentication works correctly | |
| 10.3 | Verify no references to external payment systems | No violations of App Store guidelines | |
| 10.4 | Test app in different iOS versions | App works across supported iOS versions | |

### Android Tests
| # | Test Step | Expected Result | Pass/Fail |
|---|-----------|-----------------|-----------|
| 10.1 | Test Google Play billing | Purchases complete correctly | |
| 10.2 | Test on devices without Google services | App degrades gracefully | |
| 10.3 | Test different Android versions | App works across supported Android versions | |
| 10.4 | Verify permissions on different Android versions | Permissions are requested appropriately | |

## Test Results Summary

| Test Script | Total Tests | Passed | Failed | Not Tested |
|-------------|-------------|--------|--------|------------|
| Installation and Onboarding | 10 | | | |
| Text Chat | 10 | | | |
| Video Chat | 12 | | | |
| User Preferences | 6 | | | |
| Reporting and Safety | 5 | | | |
| Premium Features | 8 | | | |
| Performance and Stability | 8 | | | |
| Notifications | 6 | | | |
| Analytics | 4 | | | |
| Platform Specific | 8 | | | |
| **TOTAL** | 77 | | | |

## Issue Tracking

Document any failed tests with the following information:

1. Test ID and description
2. Device and OS version
3. Steps to reproduce
4. Expected vs. actual behavior
5. Screenshots or video
6. Severity (Critical, High, Medium, Low)

## Testing Notes

- Complete this testing prior to each app store submission
- Maintain a separate test environment for development vs. production
- Use actual devices for final testing, not just simulators/emulators
- Test on the oldest and newest supported OS versions
- Pay special attention to permission handling, as it differs between iOS and Android