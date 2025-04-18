import abTesting, { PricingVariant } from './abTesting';
import analytics from './analytics';

// Define proper types for our pricing structure
export interface PricePoint {
  monthly: number;
  yearly: number;
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  premium: PricePoint;
  vip?: PricePoint;
}

export interface FeatureSet {
  premium: PlanFeature[];
  vip?: PlanFeature[];
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  prices: PricePoint;
  features: PlanFeature[];
  popular: boolean;
  color: string;
  buttonText: string;
  highlight?: string;
  trial?: string;
  discount?: string;
}

// Standard pricing plans (default)
const standardPricing = {
  premium: {
    monthly: 4.99,
    yearly: 49.99
  },
  vip: {
    monthly: 7.99,
    yearly: 79.99
  }
};

// Discount pricing variant (30% lower prices)
const discountPricing = {
  premium: {
    monthly: 1.99,
    yearly: 19.99
  },
  vip: {
    monthly: 5.99,
    yearly: 59.99
  }
};

// Premium pricing variant (higher prices, perceived higher value)
const premiumPricing = {
  premium: {
    monthly: 3.99,
    yearly: 39.99
  },
  vip: {
    monthly: 9.99,
    yearly: 99.99
  }
};

// Simplified pricing (just one premium tier)
const simplifiedPricing = {
  premium: {
    monthly: 4.99,
    yearly: 49.99
  }
};

// Regional pricing adjustments
const regionalPricing = {
  // Southeast Asia regional pricing
  southeastAsia: {
    premium: {
      monthly: 2.99,
      yearly: 29.99
    },
    vip: {
      monthly: 5.99,
      yearly: 59.99
    }
  },
  // Latin America regional pricing
  latinAmerica: {
    premium: {
      monthly: 3.49,
      yearly: 34.99
    },
    vip: {
      monthly: 6.99,
      yearly: 69.99
    }
  }
};

// Standard plan feature sets
const standardFeatures = {
  premium: [
    { text: 'No ads or interruptions', included: true },
    { text: 'Priority matching', included: true },
    { text: 'Profile customization', included: true },
    { text: 'Extended video time (30 minutes)', included: true },
    { text: 'VIP customer support', included: false },
    { text: 'Exclusive filters', included: false }
  ],
  vip: [
    { text: 'No ads or interruptions', included: true },
    { text: 'Priority matching', included: true },
    { text: 'Profile customization', included: true },
    { text: 'Unlimited video time', included: true },
    { text: 'VIP customer support', included: true },
    { text: 'Exclusive filters', included: true }
  ]
};

// Premium variant feature sets (more benefits highlighted)
const premiumFeatures = {
  premium: [
    { text: 'No ads or interruptions', included: true },
    { text: 'Priority matching', included: true },
    { text: 'Profile customization', included: true },
    { text: 'Extended video time (45 minutes)', included: true }, // Enhanced feature
    { text: 'VIP customer support', included: true }, // Enhanced feature
    { text: 'Exclusive filters', included: false }
  ],
  vip: [
    { text: 'No ads or interruptions', included: true },
    { text: 'Priority matching', included: true },
    { text: 'Profile customization', included: true },
    { text: 'Unlimited video time', included: true },
    { text: 'VIP customer support', included: true },
    { text: 'Exclusive filters', included: true },
    { text: 'Advanced matching algorithm', included: true }, // Additional feature
    { text: 'Early access to new features', included: true }  // Additional feature
  ]
};

// Simplified variant feature set (one premium tier with comprehensive features)
const simplifiedFeatures = {
  premium: [
    { text: 'No ads or interruptions', included: true },
    { text: 'Priority matching', included: true },
    { text: 'Profile customization', included: true },
    { text: 'Unlimited video time', included: true },
    { text: 'VIP customer support', included: true },
    { text: 'Exclusive filters', included: true },
    { text: 'All StrangerWave features', included: true }
  ]
};

// Get user's country code from browser locale or IP-based geolocation
function getUserCountry(): string {
  // Start with browser language as a fallback
  const browserLang = navigator.language || 'en-US';
  const defaultCountry = browserLang.split('-')[1] || 'US';
  
  // Try to get stored country from previous geo detection
  const storedCountry = localStorage.getItem('user_country');
  if (storedCountry) {
    return storedCountry;
  }
  
  // Return default if we can't detect (in a real implementation, we'd use IP-based detection)
  return defaultCountry;
}

// Check if user is in a specific region
function isInRegion(regionCountries: string[]): boolean {
  const userCountry = getUserCountry();
  return regionCountries.includes(userCountry);
}

// Southeast Asia country codes
const southeastAsiaCountries = ['MY', 'ID', 'PH', 'VN', 'TH', 'SG'];

// Latin America country codes
const latinAmericaCountries = ['MX', 'BR', 'AR', 'CO', 'CL', 'PE'];

/**
 * Get the subscription pricing based on the user's A/B test variant and region
 */
export function getSubscriptionPricing() {
  // Get the A/B test variant
  const variant = abTesting.getVariant('subscription_pricing_test', PricingVariant.Standard);
  
  // Check if regional pricing should be applied 
  if (variant && variant.toString() === PricingVariant.RegionalAdjusted.toString()) {
    if (isInRegion(southeastAsiaCountries)) {
      return regionalPricing.southeastAsia;
    } else if (isInRegion(latinAmericaCountries)) {
      return regionalPricing.latinAmerica;
    }
    // Fall back to standard pricing if not in a special region
    return standardPricing;
  }
  
  // Return pricing based on A/B variant
  if (variant) {
    const variantString = variant.toString();
    
    if (variantString === PricingVariant.Discount.toString()) {
      return discountPricing;
    } else if (variantString === PricingVariant.Premium.toString()) {
      return premiumPricing;
    } else if (variantString === PricingVariant.Simplified.toString()) {
      return simplifiedPricing;
    }
  }
  
  // Default to standard pricing
  return standardPricing;
}

/**
 * Get the feature set based on the user's A/B test variant
 */
export function getFeatureSets() {
  // Get the A/B test variant
  const variant = abTesting.getVariant('subscription_pricing_test', PricingVariant.Standard);
  
  // Return feature set based on A/B variant
  if (variant) {
    const variantString = variant.toString();
    
    if (variantString === PricingVariant.Premium.toString()) {
      return premiumFeatures;
    } else if (variantString === PricingVariant.Simplified.toString()) {
      return simplifiedFeatures;
    }
  }
  
  // Default to standard features for all other variants
  return standardFeatures;
}

/**
 * Get the plan structure for the current A/B test variant
 */
export function getPricingPlans() {
  // Get pricing and features based on A/B tests
  const pricing = getSubscriptionPricing();
  const features = getFeatureSets();
  
  // Get the A/B test variant for determining structure
  const variant = abTesting.getVariant('subscription_pricing_test', PricingVariant.Standard);
  const variantString = variant ? variant.toString() : PricingVariant.Standard.toString();
  
  // Base free plan (same for all variants)
  const freePlan = {
    id: 'free',
    name: 'Free',
    description: 'Access to basic features with some limitations',
    prices: {
      monthly: 0,
      yearly: 0
    },
    features: [
      { text: 'Random matching', included: true },
      { text: 'Basic chat functionality', included: true },
      { text: 'Limited video time (5 minutes)', included: true },
      { text: 'Standard support', included: true },
      { text: 'Ad-supported experience', included: true },
      { text: 'Basic filters', included: true }
    ],
    popular: false,
    color: 'bg-gray-400',
    buttonText: 'Current Plan'
  };
  
  // For simplified variant, just return free and one premium tier
  if (variantString === PricingVariant.Simplified.toString()) {
    // Handle the case where simplified pricing doesn't have a 'vip' tier
    // Make sure pricing.premium and features.premium exist
    const premiumPricing = pricing.premium || { monthly: 4.99, yearly: 49.99 };
    const premiumFeatures = features.premium || [];
    
    return [
      freePlan,
      {
        id: 'premium',
        name: 'Premium',
        description: 'All premium features in one simple plan',
        prices: premiumPricing,
        features: premiumFeatures,
        popular: true,
        color: 'bg-purple-600',
        highlight: 'All-Inclusive',
        trial: '7-day free trial',
        discount: '17% discount on yearly',
        buttonText: 'Get Premium'
      }
    ];
  }
  
  // Check if pricing and features have the necessary properties
  // This handles potential type issues when pricing might not have a 'vip' property
  const premiumPricing = pricing.premium || { monthly: 4.99, yearly: 49.99 };
  const premiumFeatures = features.premium || [];
  const vipPricing = (pricing as any).vip || { monthly: 7.99, yearly: 79.99 };
  const vipFeatures = (features as any).vip || [];
  
  // Set special highlight for discount variant
  const highlightText = variantString === PricingVariant.Discount.toString() 
    ? 'Special Offer' 
    : 'Most Affordable';
  
  // For all other variants, return the standard 3-tier structure
  return [
    freePlan,
    {
      id: 'premium',
      name: 'Premium',
      description: 'Enhanced features for serious users',
      prices: premiumPricing,
      features: premiumFeatures,
      popular: false,
      color: 'bg-blue-500',
      highlight: highlightText,
      trial: '7-day free trial',
      buttonText: 'Start Free Trial'
    },
    {
      id: 'vip',
      name: 'VIP',
      description: 'All premium features plus exclusive benefits',
      prices: vipPricing,
      features: vipFeatures,
      popular: true,
      color: 'bg-purple-600',
      highlight: 'Most Popular',
      discount: '16% discount on yearly',
      buttonText: 'Subscribe Now'
    }
  ];
}

/**
 * Track pricing-related analytics events
 */
export function trackPricingEvent(eventType: string, plan: string, additionalData: any = {}) {
  // Get the current A/B variant
  const variant = abTesting.getVariant('subscription_pricing_test', PricingVariant.Standard);
  
  // Track the event with experiment information
  abTesting.trackConversion('subscription_pricing_test', eventType, additionalData.amount);
}