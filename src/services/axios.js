import axios from "axios";

// ============================================
// API BASE URL (Fixed: Removed trailing /api to prevent double /api/api bugs)
// ============================================

const getBaseUrl = () => {
  const rawUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL;

  if (typeof rawUrl === "string" && rawUrl.trim()) {
    const match = rawUrl.match(/https?:\/\/[^\s"'<>]+/i);

    if (match) {
      // Strip trailing slashes and any accidental trailing /api
      return match[0].replace(/\/+$/, "").replace(/\/api$/i, "");
    }
  }

  if (import.meta.env.PROD) {
    return "https://beautyvibe-backend.onrender.com";
  }

  return "http://localhost:5000";
};

const API_BASE_URL = getBaseUrl();

console.info("[BeautyVibe] API Base URL:", API_BASE_URL);

// ============================================
// TOKEN MANAGEMENT
// ============================================

const getAuthToken = () => {
  try {
    return (
      localStorage.getItem("beautyvibe_user_token") ||
      localStorage.getItem("beautyvibe_admin_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("beautyvibe_user_token") ||
      null
    );
  } catch (error) {
    console.warn(
      "[BeautyVibe] Unable to access storage for token:",
      error.message
    );

    return null;
  }
};

// ============================================
// AXIOS INSTANCE
// ============================================

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

API.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },

  (error) => {
    console.error("[BeautyVibe] Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

API.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const isNetworkError =
      !error.response ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      error.message?.toLowerCase().includes("timeout");

    const method = (originalRequest.method || "get").toLowerCase();
    const isSafeMethod = ["get", "head", "options"].includes(method);

    if (
      isNetworkError &&
      isSafeMethod &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      console.warn(
        "[BeautyVibe] Backend connection failed. Retrying GET request in 5 seconds..."
      );

      await new Promise((resolve) => setTimeout(resolve, 5000));

      return API(originalRequest);
    }

    // ========================================
    // SERVER ERROR HANDLING
    // ========================================

    if (error.response) {
      const responseData = error.response.data;

      console.error("[BeautyVibe] API Error:", {
        status,
        url: originalRequest.url,
        method,
        message: responseData?.message || error.message,
      });

      if (status === 401) {
        console.warn(
          "[BeautyVibe] Unauthorized (401). Please verify Google/Firebase token storage."
        );
      }

      if (status === 403) {
        console.warn("[BeautyVibe] Access forbidden (403).");
      }

      if (status >= 500) {
        console.error("[BeautyVibe] Backend server error (5xx). Check Render logs.");
      }
    } else {
      console.error("[BeautyVibe] Network/CORS/timeout error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;