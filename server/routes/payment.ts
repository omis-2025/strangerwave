import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from '../storage';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Payment features will not work.');
}

// Use the most recent API version for Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : undefined;

// Create Stripe checkout session for banned users
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (!user.isBanned) {
      return res.status(400).json({ error: "User is not banned" });
    }
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Account Reactivation',
              description: 'Remove ban from your chat account',
            },
            unit_amount: 1099, // $10.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/payment-success`,
      cancel_url: `${req.headers.origin}/payment-canceled`,
      metadata: {
        userId: user.id.toString(),
      },
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Create a payment intent directly for client-side payment
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (!user.isBanned) {
      return res.status(400).json({ error: "User is not banned" });
    }
    
    // Create a payment intent for $10.99
    const amount = 1099; // in cents
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      // Store the user ID in the metadata
      metadata: { userId: user.id.toString() }
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

// Webhook for handling Stripe events
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    
    // Get the signature from headers
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      return res.status(400).json({ error: "Stripe signature missing" });
    }
    
    let event;
    
    // Verify webhook signature and extract the event
    try {
      // Make sure you set the webhook secret in your environment variables
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      // If there's no endpoint secret, we still want to handle events,
      // so we'll just use the raw body directly
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(
          req.body, 
          signature, 
          endpointSecret
        );
      } else {
        // If no endpoint secret, use the body directly (less secure)
        event = req.body;
        console.warn('No Stripe webhook secret configured. Webhook signature verification skipped.');
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }
    
    // Handle the event based on its type
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        // Extract the user ID from metadata
        const userId = parseInt(session.metadata.userId);
        
        if (!isNaN(userId)) {
          // Unban the user
          await storage.unbanUser(userId);
          console.log(`User ${userId} has been unbanned after successful payment`);
        }
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const paymentUserId = parseInt(paymentIntent.metadata.userId);
        
        if (!isNaN(paymentUserId)) {
          // Unban the user
          await storage.unbanUser(paymentUserId);
          console.log(`User ${paymentUserId} has been unbanned after successful payment intent`);
        }
        break;
    }
    
    // Return a 200 success response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

export default router;