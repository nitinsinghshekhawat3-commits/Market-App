// API Configuration for Market App
// Supports both development (localhost) and production (Vercel serverless backend)

// Use Vercel API routes instead of Railway
const VERCEL_BACKEND_URL = 'https://market-app-murex.vercel.app/api';

// Get base URL based on environment
// Priority: VITE_API_URL > Environment detection
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3000' : VERCEL_BACKEND_URL);

// Helper function to build full API URLs
export function getApiUrl(path) {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Build full URL
  const fullUrl = `${API_BASE_URL}/${cleanPath}`;

  // Only log in development
  if (import.meta.env.DEV) {
    console.log('[API]', cleanPath, '→', fullUrl);
  }
  
  return fullUrl;
}

// Common API endpoints
export const API_ENDPOINTS = {
  // Stock data
  STOCK: (symbol) => getApiUrl(`api/stocks/${symbol}`),

  // Crypto data
  CRYPTO: (id) => getApiUrl(`api/crypto/${id}`),

  // Market data
  MARKETS: getApiUrl('api/markets'),

  // Search
  SEARCH: (query) => getApiUrl(`api/search?q=${encodeURIComponent(query)}`),

  // Sectors
  SECTORS: (country = 'US') => getApiUrl(`api/sectors?country=${country}`),

  // Currency conversion
  FX: getApiUrl('api/fx'),

  // Global sentiment
  GLOBAL_SENTIMENT: getApiUrl('api/global-sentiment'),

  // AI endpoints
  AI_ANALYZE: getApiUrl('api/ai/analyze'),
};

// Default headers for API requests
export const API_HEADERS = {
  'Content-Type': 'application/json',
};

// Helper function for making API requests with error handling
export async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: API_HEADERS,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[API] Request failed:', error);
    throw error;
  }
}

// Environment info for debugging
export const API_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  baseUrl: API_BASE_URL,
  railwayUrl: RAILWAY_BACKEND_URL,
  viteApiUrl: import.meta.env.VITE_API_URL,
  viteApiBase: import.meta.env.VITE_API_BASE,
};

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('[API CONFIG]', API_CONFIG);
}