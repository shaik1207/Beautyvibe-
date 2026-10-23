import axios from 'axios';

// Safely extract the raw URL, stripping accidental Markdown formatting
const getBaseUrl = () => {
  let rawUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof rawUrl === 'string') {
    // Finds the first actual http/https link and ignores surrounding text/brackets
    const match = rawUrl.match(/(https?:\/\/[^\s)\]'"]+)/);
    if (match) return match[0];
  }
  return 'http://localhost:5000';
};

const API = axios.create({
  baseURL: getBaseUrl(),
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

// Response interceptor to gracefully log 401s
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