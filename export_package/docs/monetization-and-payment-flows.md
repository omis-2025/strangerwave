# StrangerWave: Monetization Strategy & Payment Flows

This document outlines the complete monetization strategy for StrangerWave, including all revenue streams, pricing recommendations, and detailed payment flow diagrams.

## Table of Contents
1. [Revenue Streams Overview](#revenue-streams-overview)
2. [Pricing Strategy](#pricing-strategy)
3. [Premium Subscription Flow](#premium-subscription-flow)
4. [Unban Payment Flow](#unban-payment-flow)
5. [Token/Coin System](#tokenscoin-system)
6. [VIP Features](#vip-features)
7. [Revenue Optimization Tips](#revenue-optimization-tips)
8. [Analytics & Metrics](#analytics--metrics)

---

## Revenue Streams Overview

StrangerWave incorporates multiple monetization channels to maximize revenue potential:

1. **Premium Subscriptions** - Monthly recurring revenue from premium users
2. **Unban Payments** - One-time fees from users who need to remove account bans
3. **Token/Coin System** - Virtual currency that users can purchase for various features
4. **VIP Features** - Enhanced capabilities for premium subscribers

### Revenue Split Projection

Based on industry benchmarks for similar platforms:

| Revenue Stream | Expected Percentage |
|----------------|---------------------|
| Premium Subscriptions | 45-60% |
| Unban Payments | 15-25% |
| Token/Coin Purchases | 20-30% |
| Other (ads, etc.) | 0-10% |

---

## Pricing Strategy

The pricing strategy aims to be competitive while maintaining strong profit margins:

### Premium Subscription
- **Price Point**: $2.99/month
- **Market Position**: Lower than most dating apps ($9.99+) but premium enough to generate meaningful revenue
- **Competitive Analysis**: Undercutting competitors to attract price-sensitive users
- **Potential Tiers**:
  - Basic Premium: $2.99/month
  - Gold Premium: $5.99/month (future expansion)

### Unban Fee
- **Price Point**: $10.99 (one-time)
- **Strategy**: High enough to be a deterrent, but not so high that users abandon the platform
- **Psychological Factor**: Users who violate rules are more likely to pay to regain access

### Token/Coin Packages
| Package | Price | Coin Amount | Value (cents/coin) |
|---------|-------|-------------|-------------------|
| Starter | $1.99 | 200 coins | 1.0¢ |
| Popular | $4.99 | 550 coins | 0.9¢ |
| Best Value | $9.99 | 1200 coins | 0.8¢ |
| Whale | $49.99 | 6500 coins | 0.77¢ |

---

## Premium Subscription Flow

### User Journey
1. User clicks on "Premium" button in the app
2. User is shown benefits of premium membership:
   - Priority matching (shorter wait times)
   - Advanced filters (more specific matching)
   - Manual video quality controls
   - Ad-free experience
   - Premium badge visible to others
3. User selects subscription option
4. User is directed to payment screen (Stripe or PayPal)
5. User completes payment
6. User account is instantly upgraded to premium

### Technical Implementation

#### Stripe Subscription Flow
```
User → Frontend subscription request → Backend creates Stripe Customer →
Backend creates Stripe Subscription → Stripe returns client secret →
Frontend confirms payment → Backend verifies subscription status →
Database updates user's premium status → User sees premium features
```

#### PayPal Subscription Flow
```
User → Frontend subscription request → Backend creates PayPal order →
User redirected to PayPal approval → User approves payment →
PayPal redirects to success URL → Backend verifies order with PayPal →
Database updates user's premium status → User sees premium features
```

### Subscription Management
- Users can manage subscriptions from their account settings
- Automatic renewal 1 day before expiration
- Grace period of 3 days after failed payment before downgrading
- Email notifications for subscription events (renewal, failed payment, etc.)

---

## Unban Payment Flow

### Ban Levels System
1. **Warning**: User receives a warning for minor violations
2. **Temporary Ban (24h)**: First serious violation
3. **Extended Ban (7 days)**: Repeated violations
4. **Permanent Ban**: Severe or continuous violations

### Unban Process
1. Banned user attempts to use the platform
2. User is shown the ban screen with:
   - Reason for the ban
   - Duration (or permanent status)
   - Option to pay $10.99 to remove the ban
3. User selects "Remove Ban" option
4. User is directed to payment screen (Stripe or PayPal)
5. User completes payment
6. User account is immediately unbanned
7. Ban count is tracked (increased prices for repeat offenders)

### Technical Implementation

#### Stripe Unban Flow
```
Banned User → Frontend unban request → Backend creates Stripe Payment Intent →
Stripe returns client secret → Frontend confirms payment →
Backend verifies payment → Database updates user's ban status →
User regains access to platform
```

#### PayPal Unban Flow
```
Banned User → Frontend unban request → Backend creates PayPal order →
User redirected to PayPal approval → User approves payment →
PayPal redirects to success URL → Backend verifies order →
Database updates user's ban status → User regains access to platform
```

---

## Token/Coin System

### Token Usage Options
1. **Boost Profile**: Increase visibility in the matching queue (50 coins)
2. **Super Skip**: Skip to high-rated users (30 coins per skip)
3. **Extended Chat**: Continue chat after time limit (100 coins)
4. **Profile Themes**: Customize profile appearance (200-500 coins)
5. **Special Emojis**: Exclusive animated emojis (20 coins each)

### Token Purchase Flow
1. User clicks on "Get Coins" button
2. User is shown coin package options
3. User selects a package
4. User is directed to payment screen (Stripe or PayPal)
5. User completes payment
6. Coins are instantly added to user's account

### Technical Implementation
```
User → Frontend coin purchase request → Backend creates Stripe/PayPal payment →
User completes payment → Backend verifies payment →
Database updates user's coin balance → User receives coins →
Coins are debited when features are used
```

---

## VIP Features

Premium users receive VIP status, which includes:

### Matching Algorithm Benefits
- 70% faster matching times
- Prioritized in the matching queue
- Preference given to match with other premium users

### Enhanced Controls
- Manual video quality selection
- Extended chat duration (no time limits)
- Additional filter options

### Visual Differentiation
- Premium badge visible in chat
- Custom profile highlights
- Exclusive themes and UI options

---

## Revenue Optimization Tips

### Conversion Optimization
1. **Strategic Limiting**: Free users experience wait times and basic features
2. **Visibility of Premium Users**: Show premium badges to increase FOMO
3. **Limited-Time Offers**: Run occasional discounts to convert hesitant users
4. **Progressive Feature Unlock**: Give free users tastes of premium features

### Retention Strategies
1. **Renewal Incentives**: Offer bonus coins for subscription renewal
2. **Loyalty Rewards**: Increasing benefits based on subscription duration
3. **Win-Back Campaigns**: Special offers for lapsed subscribers
4. **Refer-a-Friend**: Reward users with coins for bringing new users

### Pricing Optimization
1. **A/B Testing**: Test different price points in different markets
2. **Psychological Pricing**: Use .99 endings to maximize conversions
3. **Bundle Discounts**: Offer annual subscriptions at a discount
4. **Regional Pricing**: Adjust prices based on user's location

---

## Analytics & Metrics

Track these key performance indicators to measure monetization success:

### Core Metrics
- **ARPU (Average Revenue Per User)**: Target: $0.30-$0.50
- **Conversion Rate**: Target: 3-5% of active users to premium
- **LTV (Lifetime Value)**: Target: $15-25 per premium user
- **Churn Rate**: Target: <10% monthly

### Revenue-Specific Metrics
- **Subscription Growth Rate**: Weekly/monthly growth in subscriptions
- **Token Economy Volume**: Daily/weekly token purchases and usage
- **Unban Payment Rate**: Percentage of banned users who pay to return
- **Payment Method Split**: Distribution between Stripe vs. PayPal

### Feature Usage Metrics
- **Feature Popularity**: Which premium features drive most engagement
- **Upgrade Triggers**: Which actions most commonly lead to upgrades
- **Usage Patterns**: How premium users utilize their benefits

---

## Implementation Checklist

### Stripe Integration
- [x] Stripe Customer creation
- [x] Subscription management
- [x] One-time payment for unban
- [x] Token/coin package purchases
- [x] Webhook handling for subscription events

### PayPal Integration
- [x] PayPal order creation
- [x] Subscription management
- [x] One-time payment for unban
- [x] Token/coin package purchases
- [x] IPN/Webhook handling

### Database Schema
- [x] User premium status tracking
- [x] Subscription details storage
- [x] Token/coin balance management
- [x] Ban history and payment record

---

For further details on implementation, refer to the API documentation and third-party service setup guides.