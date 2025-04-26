# In-App Purchase Configuration Guide for StrangerWave

This guide provides detailed instructions for setting up In-App Purchases (IAPs) for StrangerWave on both Google Play and Apple App Store.

## StrangerWave Premium Plans

StrangerWave offers the following premium subscription tiers:

| Subscription | Price (USD) | Features |
|--------------|-------------|----------|
| **Premium** | $5.99/month | • Ad-free experience<br>• Priority matching<br>• Enhanced filters |
| **VIP** | $9.99/month | All Premium features plus:<br>• Premium badge<br>• Extended chat duration<br>• Advanced stats |
| **Ultimate** | $12.99/month | All VIP features plus:<br>• Top priority in matching<br>• Custom themes<br>• Exclusive filters |

Additionally, there is a one-time purchase for account unbanning:

| Purchase | Price (USD) | Purpose |
|----------|-------------|---------|
| **Unban Fee** | $10.99 | One-time payment to restore access after account ban |

## Google Play IAP Setup

### 1. Create In-App Products

1. Log in to the [Google Play Console](https://play.google.com/console)
2. Select your app
3. Go to "Monetize" > "Products" > "In-app products"

### 2. Set Up Subscription Products

For each subscription tier (Premium, VIP, Ultimate):

1. Click "Create subscription"
2. Enter the Product ID:
   - `com.strangerwave.app.subscription.premium`
   - `com.strangerwave.app.subscription.vip`
   - `com.strangerwave.app.subscription.ultimate`
3. Set the name that will appear to users:
   - "StrangerWave Premium"
   - "StrangerWave VIP"
   - "StrangerWave Ultimate"
4. Enter detailed description of benefits
5. Set price and billing period (monthly)
6. Configure free trial period if desired (e.g., 7 days)
7. Set up Grace Period (3 days recommended)
8. Configure Account Hold options
9. Save the subscription

### 3. Set Up One-Time Product

1. Click "Create managed product"
2. Enter the Product ID: `com.strangerwave.app.unban`
3. Set the product name: "Account Restoration"
4. Enter description: "One-time fee to restore your banned account access"
5. Set price: $10.99
6. Save the product

### 4. Configure Subscription Groups

1. Go to "Monetize" > "Subscriptions"
2. Click "Create subscription group"
3. Name it "StrangerWave Premium Plans"
4. Add all three subscription products to this group
5. Set the upgrade/downgrade options:
   - Allow upgrading from Premium to VIP or Ultimate
   - Allow upgrading from VIP to Ultimate
   - Allow downgrading with proration

### 5. Update Application Code

Ensure your app code can handle these product IDs. The relevant Stripe integration is already in place.

## Apple App Store IAP Setup

### 1. Create In-App Purchase Products

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to the "Features" tab
4. Select "In-App Purchases"
5. Click the "+" button

### 2. Set Up Subscription Products

For each subscription tier (Premium, VIP, Ultimate):

1. Select "Auto-Renewable Subscription"
2. Enter Reference Name:
   - "StrangerWave Premium Monthly"
   - "StrangerWave VIP Monthly"
   - "StrangerWave Ultimate Monthly"
3. Enter Product ID:
   - `com.strangerwave.app.subscription.premium`
   - `com.strangerwave.app.subscription.vip`
   - `com.strangerwave.app.subscription.ultimate`
4. Select "Monthly" subscription duration
5. Click "Create"
6. For each created subscription:
   - Add a Subscription Group (create "StrangerWave Premium Plans" if not exists)
   - Set subscription rank within the group (Premium: 1, VIP: 2, Ultimate: 3)
   - Configure pricing and availability
   - Add localization for each supported language
   - Add review information including screenshot of subscription

### 3. Set Up Consumable Product

1. Select "Consumable" for the unban fee
2. Enter Reference Name: "StrangerWave Account Restoration"
3. Enter Product ID: `com.strangerwave.app.unban`
4. Click "Create"
5. Configure pricing and availability
6. Add localization for each supported language
7. Add review information including screenshot

### 4. Configure Subscription Groups

1. Go to "App Information" > "Features" > "Subscriptions"
2. Configure Subscription Group Information
3. Set appropriate Ranking for each subscription tier
4. Create promotional offers if desired

### 5. Implement StoreKit in Application

The app already has StoreKit integration for iOS.

## Testing In-App Purchases

### Google Play Testing

1. Create a test account at [Play Developer Console](https://play.google.com/console)
2. Add test users in the Testing section
3. Set up a closed track for internal testing
4. Deploy your app to the closed track
5. Test users can download and make test purchases without being charged

### Apple Sandbox Testing

1. Create sandbox test accounts in App Store Connect (Users and Access > Sandbox > Testers)
2. Test on a real device with a build from Xcode or TestFlight
3. Sign out of your regular Apple ID on the device
4. When prompted to sign in during the purchase, use the sandbox account
5. Sandbox purchases won't actually charge money

## Server-Side Verification

For both platforms, subscription verification is handled through the server:

- Google Play: Using Google Play Developer API
- Apple: Using App Store Server Notifications and receipt validation

The backend has the necessary integration with Stripe for handling these subscriptions.

## Important Considerations

1. **Restore Purchases**:
   - Both platforms require the ability to restore purchases
   - This is critical for user satisfaction and compliance

2. **Subscription Management**:
   - Users must be able to view and manage their subscriptions
   - Provide clear links to subscription management pages for both platforms

3. **Cancellation Policy**:
   - Clearly communicate the cancellation policy
   - Users must be able to cancel at any time
   - Access continues until the end of the billing period

4. **Price Changes**:
   - Both platforms have specific requirements for handling price changes
   - Users must be notified of price increases

5. **Receipt Validation**:
   - Always validate receipts server-side to prevent fraud
   - For iOS, use the App Store receipt validation API
   - For Android, use the Google Play Developer API

6. **Promotional Offers**:
   - Consider offering free trials or introductory pricing
   - These can significantly increase conversion rates

## Legal Requirements

Ensure your app has the following:

1. **Terms of Service**:
   - Subscription terms clearly defined
   - Billing information and renewal policy stated
   - Cancellation policy explained

2. **Privacy Policy**:
   - Information about how subscription data is handled
   - Compliance with GDPR, CCPA, and other relevant regulations

3. **App Store Guidelines Compliance**:
   - No misleading subscription information
   - Clear disclosure of all costs
   - No "bait and switch" tactics