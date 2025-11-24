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
  timeout: 30000, // 30 second timeout (Render.com free tier can be slow on cold start)
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      baseURL: error.config?.baseURL,
      url: error.config?.url,
    });
    // Don't throw error, return a rejected promise with error info
    return Promise.reject(error);
  }
);

export default api;
export { getBaseURL };

