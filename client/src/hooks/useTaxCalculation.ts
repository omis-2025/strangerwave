import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface TaxCalculationParams {
  amount: number;
  customerLocation: string;
  customerPostalCode?: string;
  customerCity?: string;
  currency?: string;
}

interface TaxCalculationResult {
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
  calculationId: string;
}

/**
 * Custom hook for calculating taxes using Stripe Tax
 * 
 * @returns {Object} Tax calculation methods and state
 */
export function useTaxCalculation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TaxCalculationResult | null>(null);
  
  /**
   * Calculate tax for the given parameters
   * 
   * @param {TaxCalculationParams} params Tax calculation parameters 
   * @returns {Promise<TaxCalculationResult | null>} Tax calculation result or null on error
   */
  const calculateTax = async (params: TaxCalculationParams): Promise<TaxCalculationResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Make sure amount is a positive integer (in cents)
      if (params.amount <= 0 || !Number.isInteger(params.amount)) {
        throw new Error('Amount must be a positive integer in cents');
      }
      
      // Make sure customerLocation is a 2-letter country code
      if (!params.customerLocation || params.customerLocation.length !== 2) {
        throw new Error('Customer location must be a 2-letter country code');
      }
      
      // Call the tax calculation API
      const response = await apiRequest('POST', '/api/tax/calculate', params);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate tax');
      }
      
      const data = await response.json();
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while calculating tax');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Create a tax transaction record for the given calculation ID
   * Only call this after a successful payment
   * 
   * @param {string} calculationId The tax calculation ID 
   * @returns {Promise<boolean>} Whether the tax transaction was created successfully
   */
  const createTaxTransaction = async (calculationId: string): Promise<boolean> => {
    try {
      const response = await apiRequest('POST', '/api/tax/transaction', { calculationId });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create tax transaction');
      }
      
      return true;
    } catch (err: any) {
      console.error('Error creating tax transaction:', err);
      return false;
    }
  };
  
  return {
    calculateTax,
    createTaxTransaction,
    loading,
    error,
    result
  };
}