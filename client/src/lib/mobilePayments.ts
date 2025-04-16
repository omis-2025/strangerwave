import { Capacitor } from '@capacitor/core';
import { apiRequest } from './queryClient';

// Product type definitions
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'one-time' | 'subscription';
  period?: 'month' | 'year';
}

// Purchase result interface
export interface PurchaseResult {
  success: boolean;
  verified: boolean;
  transactionId?: string;
  receipt?: string;
  error?: string;
}

// Restore purchases result
export interface RestoreResult {
  restored: boolean;
  products: string[];
}

/**
 * Mobile Payments Manager Singleton
 * Handles in-app purchases for mobile platforms (iOS/Android)
 */
export class MobilePaymentsManager {
  private static instance: MobilePaymentsManager;
  private isInitialized: boolean = false;
  private platform: 'ios' | 'android' | 'web' = 'web';
  
  private constructor() {
    // Check platform based on User Agent
    const userAgent = navigator.userAgent || '';
    if (Capacitor.isNativePlatform()) {
      if (/iPhone|iPad|iPod/i.test(userAgent)) {
        this.platform = 'ios';
      } else if (/Android/i.test(userAgent)) {
        this.platform = 'android';
      }
    }
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): MobilePaymentsManager {
    if (!MobilePaymentsManager.instance) {
      MobilePaymentsManager.instance = new MobilePaymentsManager();
    }
    return MobilePaymentsManager.instance;
  }
  
  /**
   * Get current platform
   */
  public getPlatform(): 'ios' | 'android' | 'web' {
    return this.platform;
  }
  
  /**
   * Initialize the payment system
   */
  public async initialize(): Promise<void> {
    // For a real implementation, this would initialize platform-specific
    // payment SDKs like StoreKit or Google Play Billing
    this.isInitialized = true;
    return Promise.resolve();
  }
  
  /**
   * Get available products
   */
  public async getAvailableProducts(): Promise<Product[]> {
    try {
      const response = await apiRequest('GET', '/api/payments/products');
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }
  
  /**
   * Purchase a one-time product
   */
  public async purchaseProduct(
    productId: string, 
    callback: (result: PurchaseResult) => void
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      if (this.platform === 'web') {
        // For web, use Stripe checkout
        const response = await apiRequest('POST', '/api/payments/create-payment-intent', {
          productId
        });
        const { clientSecret } = await response.json();
        
        // In a real implementation, this would open Stripe Elements
        // For this example, we'll just fake a successful purchase
        setTimeout(() => {
          callback({
            success: true,
            verified: true,
            transactionId: `web_${Date.now()}`
          });
        }, 2000);
      } else if (this.platform === 'ios') {
        // For iOS, use in-app purchase
        const response = await apiRequest('POST', '/api/payments/ios/purchase', {
          productId,
          receiptData: 'mock_receipt_data' // In a real app, this would be the real receipt data
        });
        const result = await response.json();
        callback(result);
      } else if (this.platform === 'android') {
        // For Android, use Google Play Billing
        const response = await apiRequest('POST', '/api/payments/android/purchase', {
          productId,
          purchaseToken: 'mock_purchase_token' // In a real app, this would be the real purchase token
        });
        const result = await response.json();
        callback(result);
      }
    } catch (error: any) {
      callback({
        success: false,
        verified: false,
        error: error.message || 'Failed to process purchase'
      });
    }
  }
  
  /**
   * Purchase a subscription
   */
  public async purchaseSubscription(
    productId: string, 
    callback: (result: PurchaseResult) => void
  ): Promise<void> {
    // For this example, subscription purchases use the same endpoints as one-time purchases
    return this.purchaseProduct(productId, callback);
  }
  
  /**
   * Restore previous purchases
   */
  public async restorePurchases(): Promise<RestoreResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      const response = await apiRequest('POST', '/api/payments/restore');
      return await response.json();
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return { restored: false, products: [] };
    }
  }
}

// Export a default instance
export default MobilePaymentsManager.getInstance();