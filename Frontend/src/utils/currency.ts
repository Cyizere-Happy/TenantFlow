// Currency conversion rates (you can update these with real-time rates)
const EXCHANGE_RATES = {
  RWF: 1, // Base currency - Rwandan Franc
  USD: 0.00077, // 1 RWF = ~0.00077 USD (approximate)
  EUR: 0.00065,
  GBP: 0.00056,
  CAD: 0.00096,
  AUD: 0.00104,
  KES: 0.115,
  UGX: 2.85,
  TZS: 1.77
};

// Currency symbols and formatting
const CURRENCY_CONFIG = {
  RWF: { symbol: 'frw', position: 'after', decimalPlaces: 0 },
  USD: { symbol: '$', position: 'before', decimalPlaces: 2 },
  EUR: { symbol: '€', position: 'before', decimalPlaces: 2 },
  GBP: { symbol: '£', position: 'before', decimalPlaces: 2 },
  CAD: { symbol: 'C$', position: 'before', decimalPlaces: 2 },
  AUD: { symbol: 'A$', position: 'before', decimalPlaces: 2 },
  KES: { symbol: 'KSh', position: 'before', decimalPlaces: 2 },
  UGX: { symbol: 'USh', position: 'before', decimalPlaces: 0 },
  TZS: { symbol: 'TSh', position: 'before', decimalPlaces: 0 }
};

// Assume all stored amounts are in RWF (base currency)
const STORED_CURRENCY = 'RWF';

export const formatCurrency = (amount: number, displayCurrency: string = 'RWF'): string => {
  const config = CURRENCY_CONFIG[displayCurrency as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.RWF;
  
  // Convert amount from stored currency (RWF) to display currency
  const convertedAmount = convertCurrency(amount, STORED_CURRENCY, displayCurrency);
  
  // Format the number
  const formattedNumber = convertedAmount.toLocaleString('en-US', {
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces
  });
  
  // Add currency symbol
  if (config.position === 'before') {
    return `${config.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber}${config.symbol}`;
  }
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const fromRate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES] || 1;
  const toRate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES] || 1;
  
  // Convert to RWF first, then to target currency
  const rwfAmount = amount / fromRate;
  return rwfAmount * toRate;
};

export const getCurrencySymbol = (currency: string): string => {
  const config = CURRENCY_CONFIG[currency as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.RWF;
  return config.symbol;
};

export const getExchangeRate = (currency: string): number => {
  return EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1;
};

// Function to convert display currency back to stored currency (for form inputs)
export const convertToStoredCurrency = (amount: number, fromCurrency: string): number => {
  return convertCurrency(amount, fromCurrency, STORED_CURRENCY);
};

// Test function to verify currency conversion
export const testCurrencyConversion = () => {
  const testAmount = 1300000; // RWF
  console.log('Currency Conversion Test:');
  console.log(`RWF: ${formatCurrency(testAmount, 'RWF')}`);
  console.log(`USD: ${formatCurrency(testAmount, 'USD')}`);
  console.log(`EUR: ${formatCurrency(testAmount, 'EUR')}`);
  console.log(`GBP: ${formatCurrency(testAmount, 'GBP')}`);
  console.log(`KES: ${formatCurrency(testAmount, 'KES')}`);
}; 