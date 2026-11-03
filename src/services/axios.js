import axios from 'axios';

// Safely extract and normalize the base URL
const getBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  
  if (typeof rawUrl === 'string' && rawUrl.trim() !== '') {
    const match = rawUrl.match(/(https?:\/\/[^\s)\]'"]+)/);
    if (match) {
      return match[1].replace(/\/+$/, '');
    }
  }

  // In production, fallback directly to the live Render backend instead of localhost
  if (import.meta.env.PROD) {
    console.warn("⚠️ VITE_API_BASE_URL is missing. Defaulting to live Render backend.");
    return 'https://beautyvibe-backend.onrender.com/api';
  }

  return 'http://localhost:5000/api';
};

const API = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000, // Increased to 60s to safely handle Render cold starts
  withCredentials: true, // Required for secure cookie and token sharing
});

// Intercept every request to inject the correct bearer token
API.interceptors.request.use(
  (config) => {
    const token = 
      localStorage.getItem('beautyvibe_user_token') || 
      localStorage.getItem('beautyvibe_admin_token') || 
      localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, 
  (error) => Promise.reject(error)
);

// Response interceptor with auto-retry for Render cold starts
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a network error or timeout (likely a Render cold start) and we haven't retried yet
    const isColdStartOrNetworkError = !error.response || error.code === 'ECONNABORTED' || error.message?.includes('timeout');

    if (isColdStartOrNetworkError && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn("⏳ Backend is waking up from a cold start. Retrying request in 5 seconds...");
      
      // Wait 5 seconds for Render to spin up, then retry the request automatically
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return API(originalRequest);
    }

    if (error.response) {
      if (error.response.status === 401) {
        console.warn("API Request unauthorized (401). Please check user session.");
      }
    } else {
      console.error("Network or CORS error. Please verify your backend server status.");
    }
    
    return Promise.reject(error);
  }
);

export default API;