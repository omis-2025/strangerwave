# StrangerWave Admin Panel Guide

This document provides a comprehensive overview of the StrangerWave admin panel, which enables platform administrators to manage users, review reports, monitor system performance, and track monetization metrics.

## Accessing the Admin Panel

The admin panel is accessible at the following URLs:

- **Basic Admin Panel**: `/admin`
- **Enhanced Admin Panel**: `/enhanced-admin`

Only users with administrator privileges can access these pages. Any unauthorized access attempts will redirect to the home page.

## Dashboard Overview

The admin dashboard provides at-a-glance information about the platform's performance:

![Admin Dashboard](https://example.com/admin-dashboard.jpg)

### Key Performance Indicators (KPIs)

The dashboard displays the following key metrics:

1. **Total Users**: The total number of registered users on the platform
2. **Active Today**: The number of unique users who have logged in within the past 24 hours
3. **Premium Users**: The number of users with an active premium subscription
4. **Monthly Revenue**: Total revenue generated in the current month

### User Activity Charts

The dashboard includes visual representations of user activity:

1. **User Activity (24h)**: Hour-by-hour breakdown of active users over the past 24 hours
2. **Subscription Breakdown**: Pie chart showing the distribution of users across subscription tiers
3. **Engagement Metrics**: Average session length, text vs. video chat ratio, and user retention

## User Management

The user management section allows administrators to view, search, and manage user accounts:

![User Management](https://example.com/user-management.jpg)

### Available Actions

1. **Search Users**: Search by username, email, IP address, or user ID
2. **Filter Users**: Filter by status (all, banned, premium, reported, active)
3. **View User Profile**: Access detailed information about a specific user
4. **Ban User**: Temporarily or permanently ban a user from the platform
5. **Unban User**: Remove a ban from a previously banned user

### User Profile Details

When viewing a user profile, administrators can see:

- Basic account information (username, ID, creation date)
- Subscription status and tier
- Location and device information
- Chat history and reported incidents
- Ban history and status

## Report Management

The reporting system allows administrators to review and address user-submitted reports:

![Report Management](https://example.com/report-management.jpg)

### Report Workflow

1. **View Reports**: See all reports with filtering options (unresolved, resolved, all)
2. **Review Report Details**: Access detailed information about a specific report
3. **Mark as Resolved**: Flag a report as resolved after taking appropriate action
4. **Ban Reported User**: Ban the reported user directly from the report interface

### Report Information

Each report includes:

- Reported user information
- Reporter information
- Timestamp
- Reason for report
- Additional details provided by the reporter
- Chat session ID for reference

## Payment Monitoring

The payment section provides visibility into all financial transactions:

![Payment Monitoring](https://example.com/payment-monitoring.jpg)

### Transaction Types

Administrators can monitor various transaction types:

1. **Subscription Payments**: Premium, VIP, and Ultimate tier subscriptions
2. **Unban Fees**: One-time payments to remove account bans
3. **Profile Boosts**: Temporary visibility enhancements

### Payment Information

Each transaction record includes:

- Transaction ID
- User information
- Amount
- Payment processor (Stripe, PayPal)
- Status (completed, pending, failed)
- Timestamp

## Content Moderation Guidelines

When reviewing reported content, follow these guidelines:

### Violation Categories

| Category | Description | Recommended Action |
|----------|-------------|-------------------|
| Sexual Content | Explicit material, nudity, solicitation | Immediate ban (14 days) |
| Hate Speech | Racist, sexist, or discriminatory language | Warning (first offense), ban (repeat) |
| Harassment | Targeting or bullying other users | 7-day ban |
| Minor Safety | Underage users, inappropriate content involving minors | Immediate permanent ban |
| Spam/Advertising | Commercial solicitation, repetitive messaging | 3-day ban |
| Personal Information | Sharing of private data without consent | Warning and content removal |

### Ban Duration Guidelines

| Offense | Recommended Duration | Unban Fee |
|---------|---------------------|-----------|
| First Minor Violation | 3 days | $5.99 |
| Second Minor Violation | 7 days | $5.99 |
| Major Violation | 14 days | $10.99 |
| Repeat Major Violation | 30 days | $10.99 |
| Policy Violation after Multiple Bans | Permanent | Not applicable |

## System Configuration

Administrators can configure various system settings:

### Moderation Settings

- **Auto-moderation Sensitivity**: Adjust the AI moderation thresholds
- **Report Thresholds**: Set the number of reports that trigger automatic review
- **Ban Appeals**: Enable/disable the ability to pay for early ban removal

### Payment Settings

- **Subscription Pricing**: Adjust the pricing for different subscription tiers
- **Promotional Offers**: Configure time-limited discounts and offers
- **Unban Fee**: Modify the cost to remove a ban

## Analytics and Reporting

The admin panel provides detailed analytics for data-driven decision making:

### Available Reports

1. **User Growth**: Track new user registrations over time
2. **Retention Metrics**: Analyze user retention by cohort
3. **Conversion Funnel**: Monitor the journey from free to premium tiers
4. **Geographic Distribution**: View user distribution by country/region
5. **Device Breakdown**: Analyze usage across different devices and platforms

## Security and Access Control

### Administrator Roles

StrangerWave supports multiple levels of administrative access:

1. **Super Admin**: Full access to all functions and settings
2. **Moderator**: Can review reports and manage users (except other admins)
3. **Analyst**: View-only access to analytics and reporting
4. **Support**: Can view user information and handle basic account issues

### Access Controls

- All administrative actions are logged for accountability
- Two-factor authentication is required for admin access
- Session timeout after 30 minutes of inactivity
- IP-restricted access available for enhanced security

## Best Practices

### Moderation

1. **Consistency**: Apply moderation policies consistently across all users
2. **Documentation**: Keep detailed notes when taking action on reports
3. **Escalation**: Refer unclear or complex cases to senior moderators
4. **Context**: Consider the full context of a conversation before taking action

### User Management

1. **Progressive Discipline**: Start with warnings before issuing bans
2. **Communication**: Clearly explain to users why they've been banned
3. **Appeals Process**: Have a clear process for users to appeal moderation decisions
4. **Regular Review**: Periodically review ban patterns for consistency

## Troubleshooting

### Common Issues

1. **Report Backlog**: If reports accumulate, prioritize by severity and recency
2. **Payment Disputes**: For payment issues, refer to the transaction logs
3. **User Ban Appeals**: Handle appeals with consistency, following established guidelines
4. **Data Discrepancies**: If dashboard numbers seem incorrect, check the analytics refresh timestamp

## Security Considerations

1. **Admin Credentials**: Use strong, unique passwords for admin accounts
2. **Sensitive Data**: Minimize access to user personal information
3. **Action Logging**: All admin actions are logged and can be audited
4. **Regular Reviews**: Periodically review admin access and remove unnecessary privileges