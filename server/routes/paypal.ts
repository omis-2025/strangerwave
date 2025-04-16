import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage';
import { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PRODUCT_PRICES, centsToDollars } from '../paypal';

const router = express.Router();

// Create an order - Called when the user initiates a PayPal transaction
router.post('/create-order', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { productType, subscriptionType } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return res.status(500).json({ error: 'PayPal configuration missing' });
    }

    // Determine the amount based on product type
    let amount = 0;
    let isSubscription = false;
    let productName = '';

    if (productType === 'subscription') {
      if (subscriptionType === 'monthly') {
        amount = PRODUCT_PRICES.SUBSCRIPTION_MONTHLY;
        productName = 'Monthly Premium Subscription';
        isSubscription = true;
      } else {
        return res.status(400).json({ error: 'Invalid subscription type' });
      }
    } else if (productType === 'unban') {
      amount = PRODUCT_PRICES.UNBAN_FEE;
      productName = 'Account Unban Fee';
    } else {
      return res.status(400).json({ error: 'Invalid product type' });
    }

    // Create a basic PayPal order
    const order = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: centsToDollars(amount),
          },
          description: productName,
        },
      ],
      application_context: {
        brand_name: 'StrangerWave',
        user_action: 'PAY_NOW',
        return_url: `${req.protocol}://${req.get('host')}/payment/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/payment/cancel`,
      },
      // Store metadata about the transaction
      custom_id: JSON.stringify({
        userId,
        productType,
        subscriptionType: isSubscription ? subscriptionType : null,
      }),
    };

    // API request to PayPal to create an order
    const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify(order),
    });

    const data = await response.json();

    if (response.status >= 400) {
      console.error('PayPal API error:', data);
      return res.status(response.status).json({
        error: 'Failed to create PayPal order',
        details: data,
      });
    }

    // Return the order ID to the client
    return res.json({ orderId: data.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

// Capture an order - Called when the payment is approved by the user
router.post('/capture-order', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return res.status(500).json({ error: 'PayPal configuration missing' });
    }

    // API request to PayPal to capture the order
    const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      },
    });

    const data = await response.json();

    if (response.status >= 400) {
      console.error('PayPal API error:', data);
      return res.status(response.status).json({
        error: 'Failed to capture PayPal order',
        details: data,
      });
    }

    // Get transaction details
    let transactionDetails;
    try {
      transactionDetails = JSON.parse(data.purchase_units[0].payments.captures[0].custom_id || data.custom_id);
    } catch (error) {
      console.error('Error parsing transaction details:', error);
      transactionDetails = { productType: 'unknown' };
    }

    // Process payment based on product type
    if (transactionDetails.productType === 'subscription') {
      // Handle subscription payment
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days subscription

      await storage.activatePremium(userId, 'standard', expiryDate);
    } else if (transactionDetails.productType === 'unban') {
      // Handle unban payment
      await storage.incrementBanCount(userId);
      await storage.unbanUser(userId);
    }

    // Return the captured order details to the client
    return res.json({
      success: true,
      orderId: data.id,
      captureId: data.purchase_units[0].payments.captures[0].id,
      status: data.status,
    });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return res.status(500).json({ error: 'Failed to capture PayPal order' });
  }
});

// Get client ID for frontend initialization
router.get('/client-id', (req: Request, res: Response) => {
  if (!PAYPAL_CLIENT_ID) {
    return res.status(500).json({ error: 'PayPal configuration missing' });
  }
  
  return res.json({ clientId: PAYPAL_CLIENT_ID });
});

export default router;