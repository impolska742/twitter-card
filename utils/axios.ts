import axios from "axios";
import useAuthStore from "../store/auth";

const DEV_URL = "https://gtw.dev.brahma.fi/v1/";

const PROD_URL = "https://gtw.brahma.fi/v1/";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL as string) || DEV_URL;

export const apiInstance = axios.create({
  baseURL: API_URL,
});

let isRefreshing = false;

apiInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const { refreshAuth, clearAuthStorage } = useAuthStore.getState();
    const originalRequest = error.config;
    const isRefreshTokenCall = originalRequest.url === "/auth/refresh";

    if (error?.response && error?.response?.status === 401) {
      if (isRefreshTokenCall && !isRefreshing) {
        // Refresh token is expired
        console.log("refresh token is expired");
        isRefreshing = true;
        clearAuthStorage();
        isRefreshing = false;
        return;
      }

      if (!originalRequest._retry) {
        // Handle token expiration and retry the request with a refreshed token
        originalRequest._retry = true;
        console.log("retry calling the request");
        const refreshedToken = await refreshAuth();
        if (refreshedToken) {
          originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
          return apiInstance(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  }
);
