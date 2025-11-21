import axios from 'axios';

// Production backend URL - Render.com deployment
// For local development, use '/api' which proxies to localhost:3001
const getBaseURL = () => {
  // Check if we're in production (Netlify)
  if (import.meta.env.PROD) {
    // Use Render.com backend URL if available, otherwise try Netlify redirect
    return import.meta.env.VITE_API_URL || 'https://ekomobil-campaign-tool-backend.onrender.com/api';
  }
  // Development: use proxy
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    // Don't throw error, return a rejected promise with error info
    return Promise.reject(error);
  }
);

export default api;

