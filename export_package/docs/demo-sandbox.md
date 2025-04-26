# StrangerWave: Demo Sandbox

This document provides access to the StrangerWave demo environment, allowing potential buyers to explore the platform without affecting production data or real users.

## Demo Environment Access

### Demo URL

The StrangerWave sandbox demo is available at:

```
https://demo.strangerwave.com
```

Alternatively, you can use the development environment:

```
https://dev.strangerwave.com
```

### Demo Period

The demo environment refreshes every 24 hours at 00:00 UTC, resetting all data to the initial state. Any changes made during your demo session will be lost after this reset.

## Demo Accounts

### Regular User Account

Use this account to experience the standard user journey:

```
Username: demo_user
Password: StrangerWave2025!
Email: demo@strangerwave.com
```

**Account Features**:
- Basic matching functionality
- Standard video quality
- Regular user interface
- Default preferences and settings

### Premium User Account

Use this account to experience premium features:

```
Username: premium_demo
Password: Premium2025!
Email: premium@strangerwave.com
```

**Account Features**:
- Active Premium subscription
- Premium badge visible to other users
- HD video quality options
- Priority in matching queue
- Additional filtering options
- Ad-free experience

### Admin Account

Use this account to explore administrative capabilities:

```
Username: admin_demo
Password: AdminDemo2025!
Email: admin@strangerwave.com
```

**Account Features**:
- Full admin dashboard access
- User management capabilities
- Content moderation tools
- Analytics and reporting views
- System configuration options

### Special Scenario Accounts

#### Banned User

Experience the banned user flow and unban payment process:

```
Username: banned_demo
Password: BannedUser2025!
```

#### New User

Experience the first-time user onboarding:

```
Username: new_demo
Password: NewUser2025!
```

#### VIP User

Experience the highest tier of premium features:

```
Username: vip_demo
Password: VipDemo2025!
```

## Simulated Users

The demo environment includes 1,000+ simulated users with the following characteristics:

- Various countries of origin
- Different gender selections
- Range of interests and preferences
- Various activity patterns

These simulated users will appear in search results and matching. When matched with a simulated user, you'll see pre-programmed messages and interactions.

## Test Payment Methods

### Credit Card Testing

For testing payment features, use these test cards:

| Card Type | Number | Expiry | CVV |
|-----------|--------|--------|-----|
| Visa (Success) | 4242 4242 4242 4242 | Any future date | Any 3 digits |
| Visa (Decline) | 4000 0000 0000 0002 | Any future date | Any 3 digits |
| Mastercard | 5555 5555 5555 4444 | Any future date | Any 3 digits |
| 3D Secure | 4000 0000 0000 3220 | Any future date | Any 3 digits |

### PayPal Sandbox

For PayPal payment testing:

**Buyer Account**:
```
Email: buyer@strangerwave.com
Password: BuyerTest2025!
```

## Feature Testing Guide

### Core Feature Testing

1. **User Registration & Login**
   - Test account creation
   - Test login with different accounts
   - Test password recovery flow

2. **Profile Management**
   - Update profile information
   - Modify preferences
   - Change profile photo

3. **Chat Matching**
   - Test random matching
   - Test filtered matching by country/gender
   - Test premium priority matching

4. **Text Chat**
   - Send and receive messages
   - Test emoji and media sharing
   - Test reporting functionality

5. **Video Chat**
   - Test video call initiation
   - Test video quality adjustment
   - Test screen sharing (premium)
   - Test background filters (premium)

### Premium Feature Testing

1. **Subscription Management**
   - Upgrade to Premium tier
   - Upgrade to VIP tier
   - Cancel subscription
   - View subscription history

2. **Token Economy**
   - Purchase token packages
   - Use tokens for features
   - Gift tokens to other users

3. **Advanced Filters**
   - Test interest-based matching
   - Test language preference filters
   - Test location-specific matching

### Admin Features

1. **User Management**
   - Search for users
   - View user profiles
   - Ban/unban users
   - Edit user information

2. **Moderation Tools**
   - Review reported content
   - View moderation queue
   - Test automated moderation system

3. **Analytics Dashboard**
   - View user statistics
   - Review engagement metrics
   - Analyze revenue data
   - Export reports

## Mobile Testing

The demo is also available as a progressive web app (PWA) for mobile testing. Simply open the demo URL on your mobile device and add it to your home screen.

For native app testing, install the test builds using these links:

- **iOS TestFlight**: https://testflight.apple.com/join/strangerwave
- **Android APK**: https://demo.strangerwave.com/download/android

## API Access

Developer API access is available for integration testing:

```
API Base URL: https://api.demo.strangerwave.com
API Key: demo_api_key_12345
```

Documentation for the API is available at https://demo.strangerwave.com/api-docs

## Feedback & Support

While using the demo, please note any questions or feedback. You can submit them through:

- The in-app feedback form
- Email to demo-support@strangerwave.com
- The admin contact form

For immediate assistance during your evaluation, contact:

- Technical Support: +1 (555) 123-4567
- Email: buyer-support@strangerwave.com

## Demo Limitations

Please note the following limitations in the demo environment:

- Payment transactions are simulated and no actual charges will occur
- Email notifications are disabled in the demo environment
- Video quality is capped to conserve demo environment resources
- Some third-party integrations use mock responses
- User data is reset daily at 00:00 UTC

## Next Steps

After exploring the demo, we recommend:

1. Schedule a guided walkthrough with our team
2. Request access to technical documentation
3. Discuss customization possibilities
4. Receive a detailed pricing and licensing proposal

To arrange any of these next steps, please contact:

- Sales: sales@strangerwave.com
- Phone: +1 (555) 987-6543