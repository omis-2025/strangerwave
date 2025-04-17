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

// Pricing configuration (actual Stripe price IDs would be used in production)
// Fixed price for Premium - $2.99/month or $29.99/year
const PREMIUM_PRICE_MONTHLY = 299; // in cents
const PREMIUM_PRICE_YEARLY = 2999; // in cents
// Fixed price for VIP - $7.99/month or $79.99/year
const VIP_PRICE_MONTHLY = 799; // in cents
const VIP_PRICE_YEARLY = 7999; // in cents
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

    // Determine price based on plan type and interval
    let unitAmount, productName;
    if (planType.toLowerCase() === 'premium') {
      unitAmount = interval === 'yearly' ? PREMIUM_PRICE_YEARLY : PREMIUM_PRICE_MONTHLY;
      productName = 'StrangerWave Premium';
    } else {
      unitAmount = interval === 'yearly' ? VIP_PRICE_YEARLY : VIP_PRICE_MONTHLY;
      productName = 'StrangerWave VIP';
    }

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: `${interval === 'yearly' ? 'Annual' : 'Monthly'} subscription to ${productName}`,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: interval === 'yearly' ? 'year' : 'month',
            },
          },
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
            // Log unban event information for audit purposes
            console.log(`User ${userId} unbanned at ${new Date().toISOString()} via payment`);
            // We'd store this in a separate audit log table in production
            // No need to update user object with fields not in schema
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
              
              // Log unban event information for audit purposes
              console.log(`User ${userId} unbanned at ${new Date().toISOString()} via subscription purchase`);
              // We'd store this in a separate audit log table in production
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
              // In a real implementation, we'd use the price ID to determine the plan type
              // For now, we'll use the description or product name to determine the plan
              const planType = updatedSubscription.description?.toLowerCase().includes('premium') ? 
                'premium' : 'vip';
              
              // Calculate expiry date (in a real implementation, we'd use current_period_end from Stripe)
              // For now, set a fixed duration based on interval in metadata
              const expiryDate = new Date();
              if (updatedSubscription.metadata?.interval === 'yearly') {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
              } else {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
              }
              
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