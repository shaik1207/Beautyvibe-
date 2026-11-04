
import axios from "axios";

// ============================================
// API BASE URL
// ============================================

const getBaseUrl = () => {
  const rawUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL;

  if (typeof rawUrl === "string" && rawUrl.trim()) {
    // Extract a valid HTTP/HTTPS URL
    const match = rawUrl.match(/https?:\/\/[^\s"'<>]+/i);

    if (match) {
      return match[0].replace(/\/+$/, "");
    }
  }

  if (import.meta.env.PROD) {
    console.warn(
      "[BeautyVibe] API URL missing. Using production backend."
    );

    return "https://beautyvibe-backend.onrender.com/api";
  }

  return "http://localhost:5000/api";
};

const API_BASE_URL = getBaseUrl();

console.info("[BeautyVibe] API Base URL:", API_BASE_URL);

// ============================================
// TOKEN MANAGEMENT
// ============================================

const getAuthToken = () => {
  try {
    // Prefer the regular user token, then admin token,
    // then the legacy token key.
    return (
      localStorage.getItem("beautyvibe_user_token") ||
      localStorage.getItem("beautyvibe_admin_token") ||
      localStorage.getItem("token") ||
      null
    );
  } catch (error) {
    console.warn(
      "[BeautyVibe] Unable to access localStorage:",
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

    // Ensure headers exist
    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },

  (error) => {
    console.error(
      "[BeautyVibe] Request interceptor error:",
      error
    );

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

    // Retry only safe read operations.
    // Do NOT automatically retry POST/PUT/PATCH/DELETE.
    const method = (
      originalRequest.method || "get"
    ).toLowerCase();

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

      await new Promise((resolve) =>
        setTimeout(resolve, 5000)
      );

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
        message:
          responseData?.message ||
          error.message,
        code: responseData?.code,
      });

      if (status === 401) {
        console.warn(
          "[BeautyVibe] Unauthorized. User session may have expired."
        );

        // Do not automatically clear tokens or redirect here.
        // Different applications may handle user/admin sessions differently.
      }

      if (status === 403) {
        console.warn(
          "[BeautyVibe] Access forbidden. Check user permissions."
        );
      }

      if (status >= 500) {
        console.error(
          "[BeautyVibe] Backend server error. Check Render logs."
        );
      }
    } else {
      console.error(
        "[BeautyVibe] Network/CORS/timeout error:",
        error.message
      );
    }

    return Promise.reject(error);
  }
);

// ============================================
// EXPORT
// ============================================

export default API;
