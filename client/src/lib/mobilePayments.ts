import { Capacitor } from '@capacitor/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Types for mobile platforms
interface PurchaseTransaction {
  productId: string;
  transactionId: string;
  receipt: string;
  platform: 'ios' | 'android' | 'web';
  purchaseTime: number;
  verified: boolean;
}

interface MobileSubscription {
  id: string;
  productId: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  expiryDate: number; 
  autoRenewing: boolean;
}

/**
 * Mobile payments helper for handling subscriptions and purchases across platforms
 */
export class MobilePaymentsManager {
  private static instance: MobilePaymentsManager;
  private stripeInstance: Stripe | null = null;
  private isNative = Capacitor.isNativePlatform();
  private platform: 'ios' | 'android' | 'web' = 'web';
  
  // Track current subscriptions
  private activeSubscription: MobileSubscription | null = null;
  private purchaseCallback: ((result: PurchaseTransaction) => void) | null = null;

  private constructor() {
    // Determine platform
    if (this.isNative) {
      const platform = Capacitor.getPlatform();
      if (platform === 'ios') this.platform = 'ios';
      if (platform === 'android') this.platform = 'android';
    }
  }

  public static getInstance(): MobilePaymentsManager {
    if (!MobilePaymentsManager.instance) {
      MobilePaymentsManager.instance = new MobilePaymentsManager();
    }
    return MobilePaymentsManager.instance;
  }

  /**
   * Initialize payment system based on platform
   */
  public async initialize(): Promise<boolean> {
    try {
      if (this.isNative) {
        // We'll use our server-side verification for native platforms
        return true;
      } else {
        // For web, initialize Stripe
        const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
        if (!stripeKey) {
          console.error('Stripe key not found');
          return false;
        }
        
        this.stripeInstance = await loadStripe(stripeKey);
        return !!this.stripeInstance;
      }
    } catch (error) {
      console.error('Error initializing payment system:', error);
      return false;
    }
  }

  /**
   * Fetch available products/subscriptions from the server
   */
  public async getAvailableProducts(): Promise<any[]> {
    try {
      const response = await fetch('/api/payments/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  /**
   * Purchase a product (unban, premium features, etc.)
   */
  public async purchaseProduct(
    productId: string, 
    callback: (result: PurchaseTransaction) => void
  ): Promise<void> {
    this.purchaseCallback = callback;
    
    try {
      if (this.isNative) {
        if (this.platform === 'ios') {
          await this.purchaseIOS(productId);
        } else if (this.platform === 'android') {
          await this.purchaseAndroid(productId);
        }
      } else {
        // Web implementation using Stripe
        await this.purchaseWeb(productId);
      }
    } catch (error) {
      console.error('Error purchasing product:', error);
      callback({
        productId,
        transactionId: '',
        receipt: '',
        platform: this.platform,
        purchaseTime: Date.now(),
        verified: false
      });
    }
  }

  /**
   * Subscribe to a recurring product
   */
  public async purchaseSubscription(
    subscriptionId: string,
    callback: (result: PurchaseTransaction) => void
  ): Promise<void> {
    // For subscriptions, we use the same flow but with different product types
    await this.purchaseProduct(subscriptionId, callback);
  }

  /**
   * Web platform purchase using Stripe
   */
  private async purchaseWeb(productId: string): Promise<void> {
    if (!this.stripeInstance) {
      throw new Error('Stripe not initialized');
    }
    
    try {
      // Get client secret from server
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const { clientSecret } = await response.json();
      
      // Confirm payment with Stripe
      const result = await this.stripeInstance.confirmCardPayment(clientSecret);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      if (result.paymentIntent?.status === 'succeeded') {
        // Payment succeeded
        if (this.purchaseCallback) {
          this.purchaseCallback({
            productId,
            transactionId: result.paymentIntent.id,
            receipt: JSON.stringify(result.paymentIntent),
            platform: 'web',
            purchaseTime: Date.now(),
            verified: true
          });
        }
      }
    } catch (error) {
      console.error('Web purchase error:', error);
      throw error;
    }
  }

  /**
   * iOS platform purchase implementation (connects to our backend API)
   */
  private async purchaseIOS(productId: string): Promise<void> {
    try {
      // Call our backend API that handles App Store purchases
      const response = await fetch('/api/payments/ios/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process iOS purchase');
      }
      
      const result = await response.json();
      
      if (this.purchaseCallback) {
        this.purchaseCallback({
          productId,
          transactionId: result.transactionId,
          receipt: result.receipt,
          platform: 'ios',
          purchaseTime: Date.now(),
          verified: result.verified
        });
      }
    } catch (error) {
      console.error('iOS purchase error:', error);
      throw error;
    }
  }

  /**
   * Android platform purchase implementation (connects to our backend API)
   */
  private async purchaseAndroid(productId: string): Promise<void> {
    try {
      // Call our backend API that handles Google Play purchases
      const response = await fetch('/api/payments/android/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process Android purchase');
      }
      
      const result = await response.json();
      
      if (this.purchaseCallback) {
        this.purchaseCallback({
          productId,
          transactionId: result.transactionId,
          receipt: result.receipt,
          platform: 'android',
          purchaseTime: Date.now(),
          verified: result.verified
        });
      }
    } catch (error) {
      console.error('Android purchase error:', error);
      throw error;
    }
  }

  /**
   * Verify if user has active subscription
   */
  public async checkSubscriptionStatus(): Promise<{isActive: boolean, expiryDate?: Date}> {
    try {
      const response = await fetch('/api/payments/subscription/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check subscription status');
      }
      
      const { isActive, expiryDate } = await response.json();
      
      if (isActive && expiryDate) {
        return {
          isActive,
          expiryDate: new Date(expiryDate)
        };
      }
      
      return { isActive: false };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return { isActive: false };
    }
  }

  /**
   * Cancel current subscription
   */
  public async cancelSubscription(): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      
      const { success } = await response.json();
      return success;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }

  /**
   * Restore purchases (important for mobile apps)
   */
  public async restorePurchases(): Promise<{restored: boolean, products: string[]}> {
    try {
      const response = await fetch('/api/payments/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to restore purchases');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return { restored: false, products: [] };
    }
  }

  /**
   * Get current platform
   */
  public getPlatform(): 'ios' | 'android' | 'web' {
    return this.platform;
  }
}