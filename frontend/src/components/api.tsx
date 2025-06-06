import axios from "axios";
import store from "../store/index";
import { setTokens, clearTokens } from "../store/slices/authSlice"; 

const api = axios.create({
  baseURL: "https://thesis-backend-0hp9.onrender.com", 
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: any[] = [];

// Function to process queued requests after token refresh
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Request interceptor to attach access token to every request
api.interceptors.request.use(
  (config) => {
    const accessToken = store.getState().auth.accessToken; // Get access token from Redux state
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401/403 errors and refresh the access token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a 401 or 403 error and if it hasn't been retried yet
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        const refreshToken = store.getState().auth.refreshToken; 

        if (refreshToken) {
          try {
            // Request a new access token using the refresh token
            const { data } = await axios.post(
              "https://thesis-backend-0hp9.onrender.com/auth/token",
              {
                token: refreshToken,
              }
            );

            // Dispatch setTokens action to update both Redux state and localStorage
            store.dispatch(
              setTokens({ accessToken: data.accessToken, refreshToken })
            );

            // Process all queued requests with the new access token
            processQueue(null, data.accessToken);

            // Retry original request with new access token
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${data.accessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // If refresh fails, clear tokens in both Redux state and localStorage
            store.dispatch(clearTokens());
            processQueue(refreshError, null);
            window.location.href = "/login"; // Redirect to login page
          } finally {
            isRefreshing = false;
          }
        } else {
          // If no refresh token is available, redirect to login
          store.dispatch(clearTokens());
          window.location.href = "/login";
        }
      }

      // Queue failed requests while refreshing the token
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject: (err: any) => reject(err),
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
