// This file contains country data and utilities for regional pricing and localization

// Country data with ISO codes and continents/regions
export const countries = [
  { code: 'US', name: 'United States', continent: 'North America', region: 'North America' },
  { code: 'CA', name: 'Canada', continent: 'North America', region: 'North America' },
  { code: 'MX', name: 'Mexico', continent: 'North America', region: 'Latin America' },
  { code: 'BR', name: 'Brazil', continent: 'South America', region: 'Latin America' },
  { code: 'AR', name: 'Argentina', continent: 'South America', region: 'Latin America' },
  { code: 'CO', name: 'Colombia', continent: 'South America', region: 'Latin America' },
  { code: 'CL', name: 'Chile', continent: 'South America', region: 'Latin America' },
  { code: 'PE', name: 'Peru', continent: 'South America', region: 'Latin America' },
  { code: 'GB', name: 'United Kingdom', continent: 'Europe', region: 'Western Europe' },
  { code: 'DE', name: 'Germany', continent: 'Europe', region: 'Western Europe' },
  { code: 'FR', name: 'France', continent: 'Europe', region: 'Western Europe' },
  { code: 'IT', name: 'Italy', continent: 'Europe', region: 'Western Europe' },
  { code: 'ES', name: 'Spain', continent: 'Europe', region: 'Western Europe' },
  { code: 'PT', name: 'Portugal', continent: 'Europe', region: 'Western Europe' },
  { code: 'RU', name: 'Russia', continent: 'Europe', region: 'Eastern Europe' },
  { code: 'UA', name: 'Ukraine', continent: 'Europe', region: 'Eastern Europe' },
  { code: 'PL', name: 'Poland', continent: 'Europe', region: 'Eastern Europe' },
  { code: 'JP', name: 'Japan', continent: 'Asia', region: 'East Asia' },
  { code: 'KR', name: 'South Korea', continent: 'Asia', region: 'East Asia' },
  { code: 'CN', name: 'China', continent: 'Asia', region: 'East Asia' },
  { code: 'IN', name: 'India', continent: 'Asia', region: 'South Asia' },
  { code: 'PK', name: 'Pakistan', continent: 'Asia', region: 'South Asia' },
  { code: 'BD', name: 'Bangladesh', continent: 'Asia', region: 'South Asia' },
  { code: 'MY', name: 'Malaysia', continent: 'Asia', region: 'Southeast Asia' },
  { code: 'ID', name: 'Indonesia', continent: 'Asia', region: 'Southeast Asia' },
  { code: 'PH', name: 'Philippines', continent: 'Asia', region: 'Southeast Asia' },
  { code: 'VN', name: 'Vietnam', continent: 'Asia', region: 'Southeast Asia' },
  { code: 'TH', name: 'Thailand', continent: 'Asia', region: 'Southeast Asia' },
  { code: 'SG', name: 'Singapore', continent: 'Asia', region: 'Southeast Asia' },
  { code: 'AU', name: 'Australia', continent: 'Oceania', region: 'Oceania' },
  { code: 'NZ', name: 'New Zealand', continent: 'Oceania', region: 'Oceania' },
  { code: 'ZA', name: 'South Africa', continent: 'Africa', region: 'Africa' },
  { code: 'NG', name: 'Nigeria', continent: 'Africa', region: 'Africa' },
  { code: 'EG', name: 'Egypt', continent: 'Africa', region: 'Africa' },
  { code: 'SA', name: 'Saudi Arabia', continent: 'Asia', region: 'Middle East' },
  { code: 'AE', name: 'United Arab Emirates', continent: 'Asia', region: 'Middle East' },
  { code: 'IL', name: 'Israel', continent: 'Asia', region: 'Middle East' },
  { code: 'TR', name: 'Turkey', continent: 'Asia', region: 'Middle East' }
];

/**
 * Get countries by region
 */
export function getCountriesByRegion(region: string): string[] {
  return countries
    .filter(country => country.region === region)
    .map(country => country.code);
}

/**
 * Get country information by ISO code
 */
export function getCountryByCode(code: string) {
  return countries.find(country => country.code === code);
}

/**
 * Format currency based on country code
 */
export function formatCurrency(amount: number, countryCode: string = 'US'): string {
  try {
    // Default to USD if country not found
    const currency = getCurrencyForCountry(countryCode) || 'USD';
    
    return new Intl.NumberFormat(navigator.language, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting if Intl is not supported
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Get currency code for a country
 */
function getCurrencyForCountry(countryCode: string): string | null {
  const currencyMap: {[key: string]: string} = {
    'US': 'USD', 'CA': 'CAD', 'MX': 'MXN', 'BR': 'BRL', 'AR': 'ARS',
    'GB': 'GBP', 'EU': 'EUR', 'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR',
    'JP': 'JPY', 'KR': 'KRW', 'CN': 'CNY', 'IN': 'INR',
    'AU': 'AUD', 'NZ': 'NZD', 'RU': 'RUB', 'ZA': 'ZAR'
  };
  
  return currencyMap[countryCode] || null;
}