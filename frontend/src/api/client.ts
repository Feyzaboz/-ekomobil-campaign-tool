import axios from 'axios';

// Production backend URL - Render.com deployment
// For local development, use '/api' which proxies to localhost:3001
const getBaseURL = () => {
  // Check if we're in production (Netlify)
  if (import.meta.env.PROD) {
    // Use Render.com backend URL - always use the direct URL in production
    const apiUrl = import.meta.env.VITE_API_URL || 'https://ekomobil-campaign-tool.onrender.com/api';
    console.log('API Base URL:', apiUrl);
    return apiUrl;
  }
  // Development: use proxy
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout (Render.com free tier cold start can take 30-60 seconds)
});

// Retry interceptor for failed requests (especially for Render.com cold start)
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries

api.interceptors.request.use(
  (config) => {
    // Reset retry count for new requests
    if (!config.headers['X-Retry-Count']) {
      retryCount = 0;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and retry
api.interceptors.response.use(
  (response) => {
    // Reset retry count on success
    retryCount = 0;
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Don't retry if already retried max times or if it's not a network/timeout error
    const shouldRetry = 
      retryCount < MAX_RETRIES &&
      !config._retry &&
      (
        error.code === 'ECONNABORTED' || // Timeout
        error.code === 'ERR_NETWORK' || // Network error
        error.code === 'ECONNREFUSED' || // Connection refused (cold start)
        (error.response?.status >= 500 && error.response?.status < 600) // Server errors
      );

    if (shouldRetry) {
      retryCount++;
      config._retry = true;
      config.headers = config.headers || {};
      config.headers['X-Retry-Count'] = retryCount.toString();
      
      console.log(`Retrying request (${retryCount}/${MAX_RETRIES}) after ${RETRY_DELAY}ms...`, config.url);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
      
      // Retry the request
      return api(config);
    }
    
    console.error('API Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      baseURL: error.config?.baseURL,
      url: error.config?.url,
      retryCount,
    });
    
    // Reset retry count
    retryCount = 0;
    
    // Don't throw error, return a rejected promise with error info
    return Promise.reject(error);
  }
);

export default api;
export { getBaseURL };

