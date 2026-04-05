import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, targetCurrency: 'USD' | 'INR', rate: number = 1, isSourceINR: boolean = false) {
  console.log('formatCurrency Debug:', {
    rawPrice: value,
    sourceCurrency: isSourceINR ? 'INR' : 'USD',
    targetCurrency,
    fxRate: rate,
    convertedPrice: isSourceINR ? value : value * rate
  });
  
  let amount = value;
  
  if (targetCurrency === 'INR' && !isSourceINR) {
    // Convert USD to INR
    amount = value * rate;
  } else if (targetCurrency === 'USD' && isSourceINR) {
    // Convert INR to USD
    amount = value / rate;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: targetCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactNumber(number: number) {
  if (number < 1000) return number.toFixed(2);
  const formatter = Intl.NumberFormat('en', { notation: 'compact' });
  return formatter.format(number);
}
