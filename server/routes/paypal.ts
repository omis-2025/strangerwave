import { Router, Request, Response } from 'express';
import { paypalConfig } from '../paypalConfig';
import { storage } from '../storage';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Set up PayPal checkout API endpoint
router.post('/create-order', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { plan, period } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (!plan || !period) {
      return res.status(400).json({ error: "Plan and period are required" });
    }

    // Determine price based on plan and period
    let amount = '4.99';
    if (plan === 'vip') {
      amount = '7.99';
    }
    if (period === 'yearly') {
      // Apply yearly discount
      const monthlyAmount = parseFloat(amount);
      amount = (monthlyAmount * 10).toFixed(2); // 2 months free for yearly
    }

    // For demonstration, use a simple approach to create an order
    // In a real app, you would make a request to PayPal's API
    const order = {
      id: `ORDER_${Date.now()}`,
      status: 'CREATED',
      amount: {
        currency_code: 'USD',
        value: amount
      },
      links: [
        {
          href: `/api/paypal/capture-order/${Date.now()}`,
          rel: 'capture',
          method: 'POST'
        }
      ]
    };

    console.log(`Created PayPal order for user ${req.user.id}, plan: ${plan}, period: ${period}, amount: $${amount}`);
    res.json(order);
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
});

// Capture the order (finalize payment)
router.post('/capture-order/:orderID', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderID } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // For demonstration, simulate a successful payment capture
    // In a real app, you would make a request to PayPal's API
    
    // Activate the user's subscription
    // This would typically be handled by webhook in production
    await storage.updateUserSubscription(req.user.id, true, req.query.plan as string);
    
    console.log(`PayPal order ${orderID} captured for user ${req.user.id}`);
    res.json({
      id: orderID,
      status: 'COMPLETED',
      payer: {
        email_address: req.user.email || 'user@example.com'
      }
    });
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    res.status(500).json({ error: "Failed to capture PayPal order" });
  }
});

// Handle PayPal webhooks
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    
    // Verify webhook signature here (not implemented for this example)
    // In production, you should verify that the webhook came from PayPal
    
    // Process the webhook event based on its type
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        const userId = parseInt(event.resource.custom_id);
        if (!isNaN(userId)) {
          // Update the user's subscription status
          await storage.updateUserSubscription(userId, true, 'premium');
          console.log(`User ${userId} subscription activated via PayPal webhook`);
        }
        break;
      
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        const cancelUserId = parseInt(event.resource.custom_id);
        if (!isNaN(cancelUserId)) {
          // Update the user's subscription status
          await storage.updateUserSubscription(cancelUserId, false, null);
          console.log(`User ${cancelUserId} subscription cancelled via PayPal webhook`);
        }
        break;
    }
    
    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    res.status(500).json({ error: "Failed to process PayPal webhook" });
  }
});

export default router;