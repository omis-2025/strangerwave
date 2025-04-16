# StrangerWave - Anonymous Chat Platform

StrangerWave is a modern anonymous chat platform that connects users for text and video conversations. Similar to Omegle but with enhanced features, it provides a secure and feature-rich environment for random social interactions.

![StrangerWave Platform](./attached_assets/image_1744729674145.png)

## Key Features

- **Anonymous Matching**: Connect with random strangers worldwide
- **Text & Video Chat**: Seamless switching between text and video conversations  
- **Smart Filters**: Match based on gender, country, and interests
- **Mobile Ready**: Fully responsive with native mobile apps via Capacitor
- **Premium Features**: Subscription options for enhanced capabilities
- **AI Moderation**: Content filtering for a safer experience

## Getting Started

### Quick Start

1. Clone this repository
2. Copy `.env.sample` to `.env` and fill in your credentials
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server
5. Visit `http://localhost:5000` in your browser

### Test Accounts

For immediate testing, use these demo accounts:

- **Regular User**: demo_user / StrangerWave2025!
- **Premium User**: premium_demo / Premium2025!
- **Admin**: admin_demo / AdminDemo2025!

Full details in [Demo & Test Accounts](./docs/demo-test-accounts.md)

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Technical Setup Guide](./docs/technical-setup-guide.md)
- [Third-Party Services Setup](./docs/third-party-services-setup.md)
- [Monetization Strategy & Payment Flows](./docs/monetization-and-payment-flows.md)
- [Monthly Cost Breakdown](./docs/monthly-cost-breakdown.md)
- [Handover Checklist](./docs/handover-checklist.md)

For a complete overview, see the [Documentation Index](./docs/README.md).

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Authentication
- **Real-time**: WebSockets for chat, WebRTC for video
- **Payments**: Stripe and PayPal integrations
- **Mobile**: Capacitor for cross-platform mobile apps

## Deployment

The application can be deployed on any standard Node.js hosting service:

```bash
# Build the application
npm run build

# Start production server
npm start
```

See the [Technical Setup Guide](./docs/technical-setup-guide.md) for detailed deployment instructions.

## Creating Documentation Bundle

To create a ZIP file containing all documentation and assets:

```bash
./create-docs-bundle.sh
```

This will generate `strangerwave-documentation.zip` which includes all guides, configuration templates, and assets.

## License

© 2025 StrangerWave. All Rights Reserved.

## Contact

- **Support**: support@strangerwave.com
- **Business Inquiries**: sales@strangerwave.com