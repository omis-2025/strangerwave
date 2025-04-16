import { loadScript } from "@paypal/paypal-js";

// PayPal client configuration
export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn('PayPal credentials missing. PayPal payments will not work.');
}

// PayPal API options
export const PAYPAL_API_OPTIONS = {
  clientId: PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
};

// Product prices in USD cents
export const PRODUCT_PRICES = {
  SUBSCRIPTION_MONTHLY: 499, // $4.99
  UNBAN_FEE: 1099, // $10.99
};

// Helper function to convert cents to dollars
export const centsToDollars = (cents: number): string => {
  return (cents / 100).toFixed(2);
};

// Helper function to get PayPal SDK
export const getPayPalSdk = async () => {
  try {
    if (!PAYPAL_CLIENT_ID) {
      throw new Error("PayPal Client ID is not set");
    }
    return await loadScript({
      clientId: PAYPAL_CLIENT_ID,
      currency: "USD",
      intent: "capture"
    });
  } catch (error) {
    console.error("Failed to load the PayPal JS SDK script", error);
    throw error;
  }
};