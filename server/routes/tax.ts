import express from 'express';
import { calculateTax, createTaxTransaction } from '../utils/taxCalculation';
import { z } from 'zod';

const router = express.Router();

// Schema for tax calculation request validation
const taxCalculationSchema = z.object({
  amount: z.number()
    .int()
    .positive()
    .describe("Amount in cents"),
  currency: z.string()
    .min(3)
    .max(3)
    .default("eur")
    .describe("Currency code (ISO 4217)"),
  customerLocation: z.string()
    .min(2)
    .max(2)
    .describe("Customer country code (ISO 3166-1 alpha-2)"),
  customerPostalCode: z.string()
    .optional()
    .describe("Customer postal code"),
  customerCity: z.string()
    .optional()
    .describe("Customer city"),
  productDescription: z.string()
    .optional()
    .default("Food items")
    .describe("Description of the product for tax purposes"),
});

/**
 * Endpoint to calculate tax for a transaction
 * 
 * Request body should include:
 * - amount: number (in cents)
 * - currency: string (default: 'eur')
 * - customerLocation: string (country code)
 * - customerPostalCode: string (optional)
 * - customerCity: string (optional)
 * - productDescription: string (optional)
 * 
 * Response includes:
 * - taxAmount: number (in cents)
 * - totalAmount: number (amount + tax, in cents)
 * - taxRate: number (percentage)
 * - calculationId: string (to be used for createTaxTransaction)
 */
router.post('/calculate', async (req, res) => {
  try {
    // Validate request body
    const validationResult = taxCalculationSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.format()
      });
    }

    const data = validationResult.data;
    
    // Calculate tax
    const result = await calculateTax({
      amount: data.amount,
      currency: data.currency,
      customerLocation: data.customerLocation,
      customerPostalCode: data.customerPostalCode,
      customerCity: data.customerCity,
      productDescription: data.productDescription
    });

    res.json(result);
  } catch (error: any) {
    console.error('Tax calculation API error:', error);
    res.status(500).json({
      error: 'Failed to calculate tax',
      message: error.message
    });
  }
});

/**
 * Endpoint to create a tax transaction record
 * Only call this after a successful payment
 * 
 * Request body should include:
 * - calculationId: string (from tax calculation)
 * - customerId: string (Stripe customer ID)
 */
router.post('/transaction', async (req, res) => {
  try {
    const { calculationId, customerId } = req.body;
    
    if (!calculationId || !customerId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'calculationId and customerId are required'
      });
    }
    
    await createTaxTransaction(calculationId, customerId);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Tax transaction API error:', error);
    res.status(500).json({
      error: 'Failed to create tax transaction',
      message: error.message
    });
  }
});

export default router;