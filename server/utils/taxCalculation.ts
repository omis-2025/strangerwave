import Stripe from 'stripe';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : undefined;

/**
 * Calculates tax for a transaction using Stripe Tax
 * 
 * @param {Object} params Tax calculation parameters
 * @param {number} params.amount The amount in cents
 * @param {string} params.currency The currency code (default: 'eur')
 * @param {string} params.customerLocation The customer location as country code (e.g., 'ES')
 * @param {string} params.customerPostalCode The customer postal code (optional)
 * @param {string} params.customerCity The customer city (optional)
 * Note: Product description is not supported by Stripe Tax API
 * @returns {Promise<{taxAmount: number, totalAmount: number, taxRate: number, calculationId: string}>}
 */
export async function calculateTax({
  amount, 
  currency = 'eur',
  customerLocation,
  customerPostalCode,
  customerCity
}: {
  amount: number;
  currency?: string;
  customerLocation: string;
  customerPostalCode?: string;
  customerCity?: string;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    // Create a tax calculation using Stripe Tax API
    const calculation = await stripe.tax.calculations.create({
      currency,
      customer_details: {
        address: {
          country: customerLocation,
          postal_code: customerPostalCode,
          city: customerCity,
        },
        address_source: 'shipping',
      },
      line_items: [
        {
          amount, // The amount to calculate tax on (in cents)
          reference: 'food_item',
          tax_behavior: 'exclusive', // Tax is added to the amount
        },
      ],
    });

    // Extract results from calculation
    const taxAmount = calculation.tax_breakdown?.[0]?.amount || 0;
    const taxRate = calculation.tax_breakdown?.[0]?.tax_rate_details?.percentage_decimal || 0;
    const totalAmount = amount + taxAmount;

    return {
      taxAmount,
      totalAmount,
      taxRate,
      calculationId: calculation.id
    };
  } catch (error: any) {
    console.error('Tax calculation error:', error);
    throw new Error(`Failed to calculate tax: ${error.message}`);
  }
}

/**
 * Creates a tax transaction record for compliance and reporting
 * Only call this when the payment is successful
 * 
 * @param {string} calculationId The tax calculation ID from Stripe
 * @returns {Promise<void>}
 */
export async function createTaxTransaction(calculationId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    // Create a tax transaction using the previous calculation
    await stripe.tax.transactions.createFromCalculation({
      calculation: calculationId,
      reference: `food_txn_${Date.now()}`
      // Customer ID handling is managed internally by Stripe through the calculation
    });
    
    console.log(`Tax transaction created for calculation ${calculationId}`);
  } catch (error: any) {
    console.error('Tax transaction creation error:', error);
    // Don't throw here, just log the error as this is not critical for the user flow
  }
}