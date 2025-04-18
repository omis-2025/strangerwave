import { checkSecrets } from './utils/secretsCheck';

// Check if the required PayPal secrets are available
checkSecrets(['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET']);

export const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  environment: 'sandbox' // Change to 'live' for production
};