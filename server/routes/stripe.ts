import { Router } from 'express';
import Stripe from 'stripe';
import { storage } from '../storage';

const router = Router();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe payment features will not work.');
}

// Use the most recent API version for Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : undefined;

// Plan configuration
const PREMIUM_PRICE_ID = 'price_premium_monthly'; // Replace with actual Stripe price ID
const VIP_PRICE_ID = 'price_vip_monthly';         // Replace with actual Stripe price ID

// Create a checkout session for subscription plans
router.post('/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    const { planType, userId } = req.body;
    
    if (!planType || !userId || !['premium', 'vip'].includes(planType.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine which price ID to use based on plan type
    const priceId = planType.toLowerCase() === 'premium' 
      ? PREMIUM_PRICE_ID 
      : VIP_PRICE_ID;

    // Host for success and cancel URLs
    const host = req.headers.host || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${protocol}://${host}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${protocol}://${host}/pricing`,
      metadata: {
        userId: userId.toString(),
        planType: planType.toLowerCase()
      },
      client_reference_id: userId.toString()
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session', 
      message: error.message 
    });
  }
});

// Verify checkout session after payment
router.get('/verify-checkout', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    const { session_id } = req.query;
    
    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    
    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check session status
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    
    // Extract user ID and plan type from metadata
    const userId = parseInt(session.metadata?.userId || '0', 10);
    const planType = session.metadata?.planType;
    
    if (!userId || !planType) {
      return res.status(400).json({ error: 'Invalid session metadata' });
    }

    // Activate premium/vip for the user
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // Default to 1 month (will be updated by webhooks)
    
    await storage.activatePremium(userId, planType, expiryDate);
    
    res.json({ 
      success: true, 
      userId, 
      planType,
      message: `Successfully activated ${planType} subscription`
    });
  } catch (error) {
    console.error('Error verifying checkout:', error);
    res.status(500).json({ 
      error: 'Failed to verify checkout', 
      message: error.message 
    });
  }
});

// Webhook to handle Stripe events
router.post('/webhook', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err) {
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }
    
    // Handle different events
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.userId || '0', 10);
        const planType = session.metadata?.planType;
        
        if (userId && planType) {
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          await storage.activatePremium(userId, planType, expiryDate);
        }
        break;
        
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        // Update subscription details
        // In a real app, would update based on subscription period
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const customerUserId = parseInt(deletedSubscription.metadata?.userId || '0', 10);
        if (customerUserId) {
          await storage.deactivatePremium(customerUserId);
        }
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;