import axios from 'axios';

// Safely determine the base URL for local vs. production server
const getBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Hard fallback for local development
  return 'http://localhost:5000';
};

const API = axios.create({
  baseURL: getBaseUrl(),
  // CRITICAL: withCredentials is removed to prevent CORS blocks when using Bearer tokens
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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to gracefully log 401s without crashing components
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("API Request unauthorized (401). Please check user session.");
    }
    return Promise.reject(error);
  }
);

export default API;