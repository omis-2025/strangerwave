# StrangerWave: Demo & Test Accounts

This document provides access credentials for pre-configured test accounts that can be used to explore and test the StrangerWave application without needing to create new accounts or set up payment methods.

## Demo Environment

The demo accounts are configured to work in the following environment:

- **Demo URL**: https://demo.strangerwave.com
- **Demo Period**: Accounts are refreshed weekly (every Monday at 00:00 UTC)
- **Test Environment**: Full functionality but with test payment processors

## Available Test Accounts

### Regular User Account

Use this account to experience the standard user flow and features:

```
Username: demo_user
Password: StrangerWave2025!
Email: demo@strangerwave.com
```

**Account Features**:
- Basic matching functionality
- Standard video quality settings
- Regular user interface
- Reporting capabilities
- Country/gender filtering

### Premium User Account

Use this account to experience premium features:

```
Username: premium_demo
Password: Premium2025!
Email: premium@strangerwave.com
```

**Account Features**:
- Premium badge visible to other users
- Advanced video quality settings
- Priority in matching queue
- Additional filtering options
- Ad-free experience
- Access to premium-only features

### Admin Account

Use this account to access administrative functions:

```
Username: admin_demo
Password: AdminDemo2025!
Email: admin@strangerwave.com
```

**Account Features**:
- Full admin dashboard access
- User management capabilities
- Content moderation tools
- Ban/unban functionality
- Analytics and reporting
- System configuration

## Special Test States

The following accounts demonstrate specific user states:

### Banned User Account

This account demonstrates the banned user experience:

```
Username: banned_demo
Password: BannedUser2025!
```

**Account Features**:
- Shows ban notification screen
- Demonstrates unban payment flow (test mode)
- Displays appeal process

### New User Account

This account simulates a first-time user experience:

```
Username: new_demo
Password: NewUser2025!
```

**Account Features**:
- Triggers onboarding tutorial
- Shows first-time user welcome
- No saved preferences

## Test Payment Methods

When testing payment functionality, use these test credit cards:

### Stripe Test Cards

| Card Type | Number | Expiry | CVV |
|-----------|--------|--------|-----|
| Visa (Success) | 4242 4242 4242 4242 | Any future date | Any 3 digits |
| Visa (Decline) | 4000 0000 0000 0002 | Any future date | Any 3 digits |
| Mastercard (Success) | 5555 5555 5555 4444 | Any future date | Any 3 digits |
| 3D Secure | 4000 0000 0000 3220 | Any future date | Any 3 digits |

### PayPal Test Accounts

For PayPal testing, use these sandbox accounts:

**Buyer Account**:
```
Email: buyer@strangerwave.com
Password: BuyerTest2025!
```

**Business Account**:
```
Email: seller@strangerwave.com
Password: SellerTest2025!
```

## Testing Instructions

### Basic Flow Testing

1. Log in using the regular user account
2. Navigate to the main chat screen
3. Test the "Find Match" functionality
4. Test chat message sending
5. Test video call initiation
6. Try the report function
7. Test disconnection and reconnection

### Premium Features Testing

1. Log in using the premium user account
2. Verify premium badge is visible
3. Test advanced video quality controls
4. Verify priority matching (should be faster)
5. Test premium-only filters

### Admin Testing

1. Log in using the admin account
2. Navigate to the admin dashboard
3. Test user search functionality
4. Review mock reports
5. Test ban/unban functionality
6. Review analytics data

### Payment Flow Testing

1. Log in using the regular user account
2. Navigate to subscription page
3. Start payment process using test cards
4. Verify subscription status changes

## Important Notes

- These accounts are for testing purposes only
- All payment transactions in the demo environment are simulated
- Data in the demo environment is reset periodically
- Some features may have rate limits for demonstration purposes

## Support

If you encounter any issues with the demo accounts, please contact:

- **Demo Support**: demo-support@strangerwave.com
- **Technical Issues**: tech@strangerwave.com

---

Last updated: April 16, 2025