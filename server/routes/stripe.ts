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

// Plan configuration (actual Stripe price IDs would be used in production)
const PREMIUM_PRICE_ID = 'price_premium_monthly'; 
const VIP_PRICE_ID = 'price_vip_monthly';        
// Fixed price for unban fee - $10.99
const UNBAN_PRICE = 1099; // in cents

// Create a checkout session for subscription plans or unban
router.post('/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    const { planType, userId, interval } = req.body;
    
    // Validate input parameters
    if (!planType || !userId) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }
    
    // Get the user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Host for success and cancel URLs
    const host = req.headers.host || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    // Handle unban payment separately
    if (planType.toUpperCase() === 'UNBAN') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Account Unban Fee',
                description: 'One-time fee to unban your account',
              },
              unit_amount: UNBAN_PRICE, // $10.99
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${protocol}://${host}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=unban`,
        cancel_url: `${protocol}://${host}/pricing`,
        metadata: {
          userId: userId.toString(),
          paymentType: 'unban'
        },
        client_reference_id: userId.toString()
      });
      
      return res.json({ url: session.url });
    }
    
    // For subscription plans
    if (!['premium', 'vip'].includes(planType.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Determine which price ID to use based on plan type
    const priceId = planType.toLowerCase() === 'premium' 
      ? PREMIUM_PRICE_ID 
      : VIP_PRICE_ID;

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${protocol}://${host}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
      cancel_url: `${protocol}://${host}/pricing`,
      metadata: {
        userId: userId.toString(),
        planType: planType.toLowerCase(),
        interval: interval || 'monthly'
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

    const { session_id, type } = req.query;
    
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
    
    // Extract user ID from metadata
    const userId = parseInt(session.metadata?.userId || '0', 10);
    
    if (!userId) {
      return res.status(400).json({ error: 'Invalid session metadata' });
    }

    // Handle unban payment
    if (type === 'unban' || session.metadata?.paymentType === 'unban') {
      // Unban the user
      const user = await storage.unbanUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json({ 
        success: true, 
        userId, 
        paymentType: 'unban',
        message: 'Your account has been successfully unbanned. You can now continue using the chat.'
      });
    }
    
    // Handle subscription payment
    const planType = session.metadata?.planType;
    
    if (!planType) {
      return res.status(400).json({ error: 'Invalid session metadata' });
    }
    
    // Activate premium/vip for the user
    const expiryDate = new Date();
    // Default to 1 month, but check interval from metadata
    if (session.metadata?.interval === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    
    await storage.activatePremium(userId, planType, expiryDate);
    
    res.json({ 
      success: true, 
      userId, 
      planType,
      paymentType: 'subscription',
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
      console.error('Webhook signature verification failed:', err);
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }
    
    console.log(`Received Stripe webhook: ${event.type}`);
    
    // Handle different events
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.userId || '0', 10);
        
        // Skip if we can't identify the user
        if (!userId) {
          console.warn('Missing userId in session metadata');
          break;
        }
        
        console.log(`Processing completed checkout for user ${userId}`);
        
        // Handle unban payment
        if (session.metadata?.paymentType === 'unban') {
          console.log(`Processing unban payment for user ${userId}`);
          const user = await storage.unbanUser(userId);
          
          if (user) {
            console.log(`Successfully unbanned user ${userId}`);
            // Record the unban timestamp for reporting
            await storage.updateUser(userId, { 
              unbannedAt: new Date(),
              unbannedViaPayment: true 
            });
          } else {
            console.error(`Failed to unban user ${userId}, user not found`);
          }
          break;
        }
        
        // Handle subscription payment
        const planType = session.metadata?.planType;
        if (planType) {
          console.log(`Processing ${planType} subscription for user ${userId}`);
          
          const expiryDate = new Date();
          
          // Check interval for subscription duration
          if (session.metadata?.interval === 'yearly') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          } else {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          }
          
          const user = await storage.activatePremium(userId, planType, expiryDate);
          
          if (user) {
            console.log(`Successfully activated ${planType} for user ${userId} until ${expiryDate.toISOString()}`);
            
            // If the user is banned and they subscribe to Premium or VIP, automatically unban them as a courtesy
            if (user.isBanned) {
              console.log(`Auto-unbanning user ${userId} after subscription purchase`);
              await storage.unbanUser(userId);
              await storage.updateUser(userId, { 
                unbannedAt: new Date(),
                unbannedViaSubscription: true 
              });
            }
          } else {
            console.error(`Failed to activate ${planType} for user ${userId}, user not found`);
          }
        }
        break;
        
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        // Extract customer/user ID from subscription metadata
        const updatedUserId = parseInt(updatedSubscription.metadata?.userId || '0', 10);
        
        if (!updatedUserId) {
          // Try to find user via Stripe customer ID
          const stripeCustomerId = updatedSubscription.customer as string;
          console.log(`Looking up user by Stripe customer ID: ${stripeCustomerId}`);
          // This would require a way to find users by stripeCustomerId
          // In a real implementation, you'd have this field in your user records
        } else {
          // Update subscription status
          const status = updatedSubscription.status;
          const isActive = status === 'active' || status === 'trialing';
          
          if (isActive) {
            // Get plan type from subscription items
            const items = updatedSubscription.items.data;
            if (items.length > 0) {
              const priceId = items[0].price.id;
              // In production, you'd have a more robust mapping of price IDs to plan types
              const planType = priceId.includes('premium') ? 'premium' : 'vip';
              
              // Calculate expiry date based on current period end
              const expiryDate = new Date(updatedSubscription.current_period_end * 1000);
              
              console.log(`Updating subscription for user ${updatedUserId} to ${planType} until ${expiryDate.toISOString()}`);
              await storage.activatePremium(updatedUserId, planType, expiryDate);
            }
          }
        }
        break;
        
      case 'customer.subscription.created':
        const newSubscription = event.data.object as Stripe.Subscription;
        console.log(`New subscription created: ${newSubscription.id}`);
        // Similar handling as subscription.updated
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const customerUserId = parseInt(deletedSubscription.metadata?.userId || '0', 10);
        
        if (customerUserId) {
          console.log(`Deactivating premium for user ${customerUserId} due to subscription cancellation`);
          await storage.deactivatePremium(customerUserId);
        } else {
          console.warn(`Cannot deactivate subscription - missing userId in metadata for subscription ${deletedSubscription.id}`);
        }
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment intent succeeded: ${paymentIntent.id}`);
        // This can be used for one-time payments like unban fees
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${failedPayment.id}`);
        break;
    }
    
    // Return a 200 success response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;