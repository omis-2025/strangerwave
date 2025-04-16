# StrangerWave: Demo & Test Accounts

This document provides login credentials for pre-configured test accounts. These accounts can be used to immediately test the StrangerWave application's functionality without having to register new accounts.

## Test Account Information

### Regular User Account
- **Username**: demo_user
- **Password**: StrangerWave2025!
- **Role**: Standard user
- **Status**: Active
- **Features**: Basic access, no premium features

### Premium User Account
- **Username**: premium_demo
- **Password**: Premium2025!
- **Role**: Premium subscriber
- **Status**: Active premium subscription
- **Features**: All premium features active, including advanced filters and video quality controls

### Admin Account
- **Username**: admin_demo
- **Password**: AdminDemo2025!
- **Role**: Administrator
- **Status**: Full admin access
- **Features**: Access to admin panel, user management, ban controls

## How to Use Test Accounts

1. Navigate to the StrangerWave login page
2. Enter the username and password from one of the accounts above
3. You will be logged in with the specified account privileges

## Testing Specific Features

### Testing Premium Features
1. Log in with the premium_demo account
2. Navigate to the chat interface
3. Open the filter modal to see advanced options
4. Start a video call to access quality controls

### Testing Admin Functions
1. Log in with the admin_demo account
2. Access the admin panel via the profile menu
3. View user management tools and analytics
4. Test ban/unban functionality

### Testing Payment Flows (Sandbox Mode)

For testing payment flows without actual charges:

#### Stripe Test Cards
- **Card Number**: 4242 4242 4242 4242
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

#### PayPal Sandbox
- **Email**: sb-buyer@strangerwave.com
- **Password**: testbuyer123

## Important Notes for Buyers

1. These are test accounts only and should be removed or changed before going to production
2. The accounts are preconfigured in the database during setup
3. Passwords should be changed immediately after purchase
4. For security reasons, create new admin accounts with strong passwords for production use

## Production Setup Recommendation

Once you're ready to go to production:

1. Delete or reset all test accounts
2. Create a new secure admin account
3. Update all API keys and secrets to production values
4. Change all default passwords and credentials