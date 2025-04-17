import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Plan configuration
export const STRIPE_PRICES = {
  PREMIUM: {
    monthly: 'price_premium_monthly', // Replace with your actual Stripe price ID
    yearly: 'price_premium_yearly'     // Replace with your actual Stripe price ID
  },
  VIP: {
    monthly: 'price_vip_monthly',      // Replace with your actual Stripe price ID
    yearly: 'price_vip_yearly'         // Replace with your actual Stripe price ID
  },
  UNBAN: 'price_unban_fee'             // Replace with your actual Stripe price ID
};

interface CreateCheckoutOptions {
  planType: 'PREMIUM' | 'VIP' | 'UNBAN';
  userId: number;
  interval?: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
}

/**
 * Creates a Stripe checkout session for subscription or one-time payments
 */
export async function createCheckoutSession({
  planType,
  userId,
  interval = 'monthly',
  successUrl,
  cancelUrl
}: CreateCheckoutOptions): Promise<string> {
  
  // Determine if this is a subscription or one-time payment
  const isSubscription = planType !== 'UNBAN';
  
  // Get the appropriate price ID
  let priceId: string;
  if (isSubscription) {
    priceId = STRIPE_PRICES[planType][interval];
  } else {
    priceId = STRIPE_PRICES.UNBAN;
  }
  
  // Create the session with appropriate parameters
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: isSubscription ? 'subscription' : 'payment',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId.toString(),
      planType
    },
    client_reference_id: userId.toString()
  });
  
  return session.url || '';
}

/**
 * Retrieves a checkout session by ID
 */
export async function getCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Create a webhook handler to process events from Stripe
 */
export function handleStripeWebhook(
  signature: string,
  payload: Buffer,
  webhookSecret: string
) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return event;
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
}