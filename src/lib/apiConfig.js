// API Configuration for Market App
// Supports both development (localhost) and production (Railway/Vercel) environments

const RAILWAY_BACKEND_URL = 'https://market-app-production-05b2.up.railway.app';

// Get base URL based on environment
// Priority: VITE_API_URL > Environment detection
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3000' : RAILWAY_BACKEND_URL);

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
  stocks: (symbol) => `/api/stocks/${symbol}`,
  
  // Crypto data
  crypto: (id) => `/api/crypto/${id}`,
  
  // Global markets
  markets: '/api/markets',
  
  // Search
  search: '/api/search',
  
  // Sectors
  sectors: '/api/sectors',
  
  // Currency conversion (FX)
  fx: '/api/fx',
  
  // Global sentiment
  sentiment: '/api/global-sentiment',
  
  // AI analysis
  aiAnalyze: '/api/ai/analyze',
};

// Fetch data from API with error handling
export async function fetchAPI(endpoint, options = {}) {
  try {
    const url = typeof endpoint === 'string' && endpoint.startsWith('/') 
      ? getApiUrl(endpoint) 
      : endpoint;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}
