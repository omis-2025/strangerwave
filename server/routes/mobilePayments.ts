import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage';

const router = express.Router();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Product ids and prices for different platforms
const PRODUCTS = {
  SUBSCRIPTION_MONTHLY: {
    web: 'price_monthly_web',
    ios: 'com.strangerwave.app.subscription.monthly',
    android: 'com.strangerwave.app.subscription.monthly'
  },
  UNBAN_FEE: {
    web: 'price_unban_web',
    ios: 'com.strangerwave.app.unban',
    android: 'com.strangerwave.app.unban'
  }
};

// Get available products
router.get('/products', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get platform from user-agent or query parameter
    const userAgent = req.headers['user-agent'] || '';
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    
    const platform = isIOS ? 'ios' : (isAndroid ? 'android' : 'web');
    
    // Return appropriate products for platform
    const products = [
      {
        id: PRODUCTS.SUBSCRIPTION_MONTHLY[platform],
        name: 'Monthly Premium Subscription',
        description: 'Unlock all premium features with monthly subscription',
        price: 4.99,
        currency: 'USD',
        type: 'subscription',
        period: 'month'
      },
      {
        id: PRODUCTS.UNBAN_FEE[platform],
        name: 'Account Unban',
        description: 'Remove account ban and restore chat privileges',
        price: 10.99,
        currency: 'USD',
        type: 'one-time'
      }
    ];
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create payment intent (Web/Stripe)
router.post('/create-payment-intent', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;
    
    // Get product details based on ID
    let amount = 0;
    let isSubscription = false;
    
    if (productId === PRODUCTS.SUBSCRIPTION_MONTHLY.web) {
      amount = 499; // $4.99
      isSubscription = true;
    } else if (productId === PRODUCTS.UNBAN_FEE.web) {
      amount = 1099; // $10.99
    } else {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    if (isSubscription) {
      // For subscriptions, create a subscription
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if user already has a Stripe customer ID
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        // Create a customer
        const customer = await stripe.customers.create({
          name: user.username,
          metadata: {
            userId: userId.toString()
          }
        });
        
        customerId = customer.id;
        await storage.updateStripeCustomerId(userId, customerId);
      }
      
      // Create a subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          { price: productId },
        ],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Return client secret
      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id
      });
    } else {
      // For one-time purchases, create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
          userId: userId.toString(),
          productId
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// iOS purchase verification
router.post('/ios/purchase', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { productId, receiptData } = req.body;
    const userId = req.user.userId;
    
    // In a real implementation, you would verify the receipt with Apple
    // This requires server-to-server communication with Apple's servers
    
    // For this example, we'll simulate a successful purchase
    const isVerified = true;
    const transactionId = `ios_${Date.now()}`;
    
    if (isVerified) {
      // Handle the purchase based on product type
      if (productId === PRODUCTS.SUBSCRIPTION_MONTHLY.ios) {
        // Handle subscription
        await storage.updateUser(userId, {
          isPremium: true,
          premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
      } else if (productId === PRODUCTS.UNBAN_FEE.ios) {
        // Handle unban
        await storage.unbanUser(userId);
      }
      
      res.json({
        success: true,
        verified: true,
        transactionId,
        receipt: 'receipt_data_here'
      });
    } else {
      res.status(400).json({
        success: false,
        verified: false,
        error: 'Invalid receipt'
      });
    }
  } catch (error) {
    console.error('Error processing iOS purchase:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// Android purchase verification
router.post('/android/purchase', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { productId, purchaseToken } = req.body;
    const userId = req.user.userId;
    
    // In a real implementation, you would verify the purchase token with Google Play
    // This requires server-to-server communication with Google's servers
    
    // For this example, we'll simulate a successful purchase
    const isVerified = true;
    const transactionId = `android_${Date.now()}`;
    
    if (isVerified) {
      // Handle the purchase based on product type
      if (productId === PRODUCTS.SUBSCRIPTION_MONTHLY.android) {
        // Handle subscription
        await storage.updateUser(userId, {
          isPremium: true,
          premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
      } else if (productId === PRODUCTS.UNBAN_FEE.android) {
        // Handle unban
        await storage.unbanUser(userId);
      }
      
      res.json({
        success: true,
        verified: true,
        transactionId,
        receipt: 'receipt_data_here'
      });
    } else {
      res.status(400).json({
        success: false,
        verified: false,
        error: 'Invalid purchase token'
      });
    }
  } catch (error) {
    console.error('Error processing Android purchase:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// Check subscription status
router.get('/subscription/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isActive = user.isPremium && user.premiumUntil && new Date(user.premiumUntil) > new Date();
    
    res.json({
      isActive,
      expiryDate: user.premiumUntil
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

// Cancel subscription
router.post('/subscription/cancel', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has a Stripe subscription
    if (user.stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'active'
      });
      
      if (subscriptions.data.length > 0) {
        // Cancel the subscription
        await stripe.subscriptions.update(subscriptions.data[0].id, {
          cancel_at_period_end: true
        });
      }
    }
    
    // Mark user as not premium after current period
    // We don't immediately remove premium status
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Restore purchases
router.post('/restore', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has active premium status
    const isPremium = user.isPremium && user.premiumUntil && new Date(user.premiumUntil) > new Date();
    
    // Check if user is banned
    const isBanned = user.isBanned || false;
    
    const restoredProducts = [];
    
    if (isPremium) {
      restoredProducts.push(PRODUCTS.SUBSCRIPTION_MONTHLY.web);
    }
    
    if (!isBanned) {
      restoredProducts.push(PRODUCTS.UNBAN_FEE.web);
    }
    
    res.json({
      restored: restoredProducts.length > 0,
      products: restoredProducts
    });
  } catch (error) {
    console.error('Error restoring purchases:', error);
    res.status(500).json({ error: 'Failed to restore purchases' });
  }
});

export default router;