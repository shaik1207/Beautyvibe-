import axios from 'axios';

// Safely extract and normalize the base URL
const getBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  
  if (typeof rawUrl === 'string' && rawUrl.trim() !== '') {
    // Finds the first actual http/https link and ignores surrounding text/brackets
    const match = rawUrl.match(/(https?:\/\/[^\s)\]'"]+)/);
    if (match) {
      // Strip trailing slashes to prevent double slashes in API endpoints
      return match[1].replace(/\/+$/, '');
    }
  }

  // Fallback warning if environment variable is missing in production
  if (import.meta.env.PROD) {
    console.warn("⚠️ VITE_API_BASE_URL is not defined in your Vercel environment variables. API calls may fail.");
  }

  return 'http://localhost:5000';
};

const API = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000, // 15s timeout to prevent hanging during cold starts
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

// Response interceptor to gracefully log 401s and network/CORS issues
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn("API Request unauthorized (401). Please check user session.");
      }
    } else {
      console.error("Network or CORS error. Please verify your VITE_API_BASE_URL points to a live backend URL.");
    }
    return Promise.reject(error);
  }
);

export default API;